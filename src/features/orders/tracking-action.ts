"use server";

import { findCustomerOrders } from "./customer-order-lookup";
import {
  normalizeJerseyNumber,
  normalizePhoneNumber,
  normalizePrintedName
} from "./search-normalization";
import type { TrackingSearchState } from "./tracking-state";

export async function searchCustomerOrdersAction(
  _previousState: TrackingSearchState,
  formData: FormData
): Promise<TrackingSearchState> {
  const searchMode = formData.get("searchMode");

  if (searchMode === "customer") {
    return searchByCustomer(formData);
  }

  if (searchMode === "jersey") {
    return searchByJersey(formData);
  }

  return invalidSearchState("Choose how you want to search.");
}

async function searchByCustomer(formData: FormData): Promise<TrackingSearchState> {
  const searchType = formData.get("customerSearchType");
  const query = formData.get("customerQuery");

  if (searchType !== "name" && searchType !== "phone") {
    return invalidSearchState("Choose full name or phone number.");
  }

  if (typeof query !== "string" || query.trim() === "") {
    return invalidSearchState("Enter a full name or phone number.");
  }

  if (searchType === "phone" && normalizePhoneNumber(query).length < 7) {
    return invalidSearchState("Enter a complete phone number.");
  }

  const result = await findCustomerOrders({
    mode: "customer",
    type: searchType,
    value: query
  });

  return toTrackingSearchState(result);
}

async function searchByJersey(formData: FormData): Promise<TrackingSearchState> {
  const printName = formData.get("printName");
  const shirtNumber = formData.get("shirtNumber");

  if (
    typeof printName !== "string" ||
    normalizePrintedName(printName) === "" ||
    typeof shirtNumber !== "string" ||
    normalizeJerseyNumber(shirtNumber) === ""
  ) {
    return invalidSearchState("Enter both printed name and jersey number.");
  }

  const result = await findCustomerOrders({
    mode: "jersey",
    printName,
    shirtNumber
  });

  return toTrackingSearchState(result);
}

function toTrackingSearchState(
  result: Awaited<ReturnType<typeof findCustomerOrders>>
): TrackingSearchState {
  if (!result.ok) {
    return result.error === "invalid_input"
      ? invalidSearchState("Check your search details and try again.")
      : {
          status: "error",
          message:
            "We could not check your order right now. Please try again later.",
          orders: []
        };
  }

  if (result.orders.length === 0) {
    return {
      status: "no_results",
      message: "No matching orders were found.",
      orders: []
    };
  }

  return {
    status: "success",
    message:
      result.orders.length === 1
        ? "1 matching order found."
        : `${result.orders.length} matching orders found.`,
    orders: result.orders
  };
}

function invalidSearchState(message: string): TrackingSearchState {
  return {
    status: "invalid",
    message,
    orders: []
  };
}
