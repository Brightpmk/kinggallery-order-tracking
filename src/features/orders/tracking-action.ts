"use server";

import { findCustomerOrders } from "./customer-order-lookup";
import {
  normalizeJerseyNumber,
  normalizePhoneNumber,
  normalizePrintedName
} from "./search-normalization";
import type {
  CustomerSearchType,
  TrackingSearchMode,
  TrackingSearchState
} from "./tracking-state";

type SearchContext = {
  searchMode: TrackingSearchMode;
  customerSearchType: CustomerSearchType;
  submissionToken: number;
};

export async function searchCustomerOrdersAction(
  previousState: TrackingSearchState,
  formData: FormData
): Promise<TrackingSearchState> {
  const searchMode = formData.get("searchMode");

  if (searchMode === "customer") {
    return searchByCustomer(formData, previousState);
  }

  if (searchMode === "jersey") {
    return searchByJersey(formData, previousState);
  }

  return invalidSearchState("Choose how you want to search.", {
    searchMode: previousState.searchMode,
    customerSearchType: previousState.customerSearchType,
    submissionToken: previousState.submissionToken + 1
  });
}

async function searchByCustomer(
  formData: FormData,
  previousState: TrackingSearchState
): Promise<TrackingSearchState> {
  const searchType = formData.get("customerSearchType");
  const query = formData.get("customerQuery");

  if (searchType !== "name" && searchType !== "phone") {
    return invalidSearchState("Choose full name or phone number.", {
      searchMode: "customer",
      customerSearchType: "name",
      submissionToken: previousState.submissionToken + 1
    });
  }

  const searchContext: SearchContext = {
    searchMode: "customer" as const,
    customerSearchType: searchType,
    submissionToken: previousState.submissionToken + 1
  };

  if (typeof query !== "string" || query.trim() === "") {
    return invalidSearchState("Enter a full name or phone number.", {
      ...searchContext
    });
  }

  if (searchType === "phone" && normalizePhoneNumber(query).length < 7) {
    return invalidSearchState("Enter a complete phone number.", {
      ...searchContext
    });
  }

  const result = await findCustomerOrders({
    mode: "customer",
    type: searchType,
    value: query
  });

  return toTrackingSearchState(result, searchContext);
}

async function searchByJersey(
  formData: FormData,
  previousState: TrackingSearchState
): Promise<TrackingSearchState> {
  const printName = formData.get("printName");
  const shirtNumber = formData.get("shirtNumber");
  const searchContext: SearchContext = {
    searchMode: "jersey" as const,
    customerSearchType: previousState.customerSearchType,
    submissionToken: previousState.submissionToken + 1
  };

  if (
    typeof printName !== "string" ||
    normalizePrintedName(printName) === "" ||
    typeof shirtNumber !== "string" ||
    normalizeJerseyNumber(shirtNumber) === ""
  ) {
    return invalidSearchState(
      "Enter both printed name and jersey number.",
      searchContext
    );
  }

  const result = await findCustomerOrders({
    mode: "jersey",
    printName,
    shirtNumber
  });

  return toTrackingSearchState(result, searchContext);
}

function toTrackingSearchState(
  result: Awaited<ReturnType<typeof findCustomerOrders>>,
  searchContext: SearchContext
): TrackingSearchState {
  if (!result.ok) {
    return result.error === "invalid_input"
      ? invalidSearchState(
          "Check your search details and try again.",
          searchContext
        )
      : {
          status: "error",
          message:
            "We could not check your order right now. Please try again later.",
          orders: [],
          ...searchContext
        };
  }

  if (result.orders.length === 0) {
    return {
      status: "no_results",
      message: "No matching orders were found.",
      orders: [],
      ...searchContext
    };
  }

  return {
    status: "success",
    message:
      result.orders.length === 1
        ? "1 matching order found."
        : `${result.orders.length} matching orders found.`,
    orders: result.orders,
    ...searchContext
  };
}

function invalidSearchState(
  message: string,
  searchContext: SearchContext
): TrackingSearchState {
  return {
    status: "invalid",
    message,
    orders: [],
    ...searchContext
  };
}
