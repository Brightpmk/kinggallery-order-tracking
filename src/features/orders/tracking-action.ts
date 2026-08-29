"use server";

import { findOrders } from "./jersey-order-lookup";
import {
  normalizeFullName,
  normalizeJerseyNumber,
  normalizePhoneNumber,
  normalizePrintedName
} from "./search-normalization";
import type { TrackingSearchState } from "./tracking-state";

export async function searchOrdersAction(
  _previousState: TrackingSearchState,
  formData: FormData
): Promise<TrackingSearchState> {
  const searchMode = formData.get("searchMode");
  const fullName = formData.get("fullName");
  const phoneNumber = formData.get("phoneNumber");
  const printName = formData.get("printName");
  const shirtNumber = formData.get("shirtNumber");

  if (searchMode === "customer") {
    if (
      typeof fullName !== "string" ||
      typeof phoneNumber !== "string" ||
      (normalizeFullName(fullName) === "" && normalizePhoneNumber(phoneNumber) === "")
    ) {
      return invalidSearchState("Enter a full name or phone number.");
    }

    const result = await findOrders({
      searchMode,
      fullName,
      phoneNumber
    });

    return toTrackingSearchState(result, searchMode);
  }

  if (
    searchMode !== "jersey" ||
    typeof printName !== "string" ||
    normalizePrintedName(printName) === "" ||
    typeof shirtNumber !== "string" ||
    normalizeJerseyNumber(shirtNumber) === ""
  ) {
    return invalidSearchState("Enter both printed name and jersey number.");
  }

  const result = await findOrders({
    searchMode,
    printName,
    shirtNumber
  });

  return toTrackingSearchState(result, searchMode);
}

function toTrackingSearchState(
  result: Awaited<ReturnType<typeof findOrders>>,
  searchMode: "customer" | "jersey"
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
      message:
        searchMode === "customer"
          ? "No matching orders were found."
          : "No matching jerseys were found.",
      orders: []
    };
  }

  const matchingItemCount = result.orders.reduce(
    (total, order) => total + order.items.length,
    0
  );

  return {
    status: "success",
    message:
      searchMode === "customer"
        ? result.orders.length === 1
          ? "1 matching order found."
          : `${result.orders.length} matching orders found.`
        : matchingItemCount === 1
          ? "1 matching jersey found."
          : `${matchingItemCount} matching jerseys found.`,
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
