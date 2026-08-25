"use server";

import { findCustomerOrders } from "./customer-order-lookup";
import { normalizePhoneNumber } from "./search-normalization";
import type { TrackingSearchState } from "./tracking-state";

export async function searchCustomerOrdersAction(
  _previousState: TrackingSearchState,
  formData: FormData
): Promise<TrackingSearchState> {
  const searchType = formData.get("searchType");
  const query = formData.get("query");

  if (searchType !== "name" && searchType !== "phone") {
    return invalidSearchState("Choose how you want to search.");
  }

  if (typeof query !== "string" || query.trim() === "") {
    return invalidSearchState("Enter a full name or phone number.");
  }

  if (searchType === "phone" && normalizePhoneNumber(query).length < 7) {
    return invalidSearchState("Enter a complete phone number.");
  }

  // Phase 3 intentionally allows name-or-phone lookup for convenience.
  // Future phases should strengthen verification before exposing order details.
  const result = await findCustomerOrders({
    type: searchType,
    value: query
  });

  if (!result.ok) {
    return result.error === "invalid_input"
      ? invalidSearchState("Enter a full name or phone number.")
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
