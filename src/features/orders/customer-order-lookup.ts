import "server-only";

import { readGoogleFormSheetRows } from "@/lib/google-sheets/sheets-client";
import {
  adaptGoogleFormSheetRows,
  GoogleFormSheetSchemaError
} from "./google-form-sheet-adapter";
import type { OrderSheetSource } from "./order-source";
import { searchOrders } from "./order-search";
import type { TrackingSearchInput } from "./search-normalization";
import type { PublicOrderSummary } from "./types";

export type CustomerOrderLookupResult =
  | {
      ok: true;
      orders: PublicOrderSummary[];
      source: "google_sheets";
    }
  | {
      ok: false;
      error: "invalid_input" | "lookup_failed";
    };

const googleFormSheetSource: OrderSheetSource = {
  readRows: readGoogleFormSheetRows
};

export async function findCustomerOrders(
  input: TrackingSearchInput,
  source: OrderSheetSource = googleFormSheetSource
): Promise<CustomerOrderLookupResult> {
  if (!isValidLookupInput(input)) {
    return { ok: false, error: "invalid_input" };
  }

  try {
    const rows = await source.readRows();
    const { orders, diagnostics } = adaptGoogleFormSheetRows(rows);

    if (diagnostics.skippedRows > 0 || diagnostics.malformedMultiJerseyEntries > 0) {
      console.warn("Google Form Sheet lookup skipped malformed data.", {
        skippedRows: diagnostics.skippedRows,
        malformedMultiJerseyEntries: diagnostics.malformedMultiJerseyEntries
      });
    }

    return {
      ok: true,
      orders: searchOrders(orders, input),
      source: "google_sheets"
    };
  } catch (error) {
    logOrderLookupError(error);
    return { ok: false, error: "lookup_failed" };
  }
}

function isValidLookupInput(input: TrackingSearchInput): boolean {
  if (input.mode === "customer") {
    return input.value.trim() !== "";
  }

  return input.printName.trim() !== "" && input.shirtNumber.trim() !== "";
}

function logOrderLookupError(error: unknown): void {
  if (error instanceof GoogleFormSheetSchemaError) {
    console.error("Google Form Sheet schema mismatch.", {
      message: error.message
    });
    return;
  }

  if (isGoogleApiError(error)) {
    console.error("Google Sheets order lookup failed.", {
      code: error.code,
      message: error.message
    });
    return;
  }

  console.error("Order lookup failed.", {
    message: error instanceof Error ? error.message : "Unknown error"
  });
}

function isGoogleApiError(
  error: unknown
): error is { code?: string | number; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  );
}
