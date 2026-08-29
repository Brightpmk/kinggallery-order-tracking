"use server";

import { findJerseyOrders } from "./jersey-order-lookup";
import {
  normalizeJerseyNumber,
  normalizePrintedName
} from "./search-normalization";
import type { TrackingSearchState } from "./tracking-state";

export async function searchJerseyOrdersAction(
  _previousState: TrackingSearchState,
  formData: FormData
): Promise<TrackingSearchState> {
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

  const result = await findJerseyOrders({
    printName,
    shirtNumber
  });

  return toTrackingSearchState(result);
}

function toTrackingSearchState(
  result: Awaited<ReturnType<typeof findJerseyOrders>>
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
      message: "No matching jerseys were found.",
      orders: []
    };
  }

  return {
    status: "success",
    message:
      result.orders.length === 1
        ? "1 matching jersey found."
        : `${result.orders.length} matching jerseys found.`,
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
