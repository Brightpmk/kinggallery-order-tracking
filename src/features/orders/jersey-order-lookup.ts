import "server-only";

import {
  readGoogleFormSheetRows,
  readManualOrderSheetRows
} from "@/lib/google-sheets/sheets-client";
import { adaptGoogleFormSheetRows } from "./google-form-sheet-adapter";
import { adaptManualOrderSheetRows } from "./manual-order-sheet-adapter";
import type { OrderSheetSource } from "./order-source";
import { searchJerseyOrders, searchOrders } from "./order-search";
import type {
  JerseyOrderSearchInput,
  OrderSearchInput
} from "./search-normalization";
import { normalizeOrderSearch } from "./search-normalization";
import { SheetSchemaError } from "./sheet-normalization";
import type { OrderRecord, PublicOrderSummary } from "./types";

export type JerseyOrderLookupResult =
  | {
      ok: true;
      orders: PublicOrderSummary[];
      source: "google_sheets";
    }
  | {
      ok: false;
      error: "invalid_input" | "lookup_failed";
    };

const orderSheetSources = {
  googleForm: {
    name: "google_form",
    readRows: readGoogleFormSheetRows,
    adaptRows: adaptGoogleFormSheetRows
  },
  manualOrders: {
    name: "manual",
    readRows: readManualOrderSheetRows,
    adaptRows: adaptManualOrderSheetRows
  }
} satisfies Record<
  string,
  OrderSheetSource & {
    adaptRows: (rows: Awaited<ReturnType<OrderSheetSource["readRows"]>>) => {
      orders: OrderRecord[];
      diagnostics: {
        skippedRows: number;
        malformedMultiJerseyEntries: number;
        unexpectedPaymentStatusValues: number;
      };
    };
  }
>;

export async function findJerseyOrders(
  input: JerseyOrderSearchInput
): Promise<JerseyOrderLookupResult> {
  if (input.printName.trim() === "" || input.shirtNumber.trim() === "") {
    return { ok: false, error: "invalid_input" };
  }

  try {
    const orders = await readAllNormalizedOrders();

    return {
      ok: true,
      orders: searchJerseyOrders(orders, input),
      source: "google_sheets"
    };
  } catch (error) {
    logOrderLookupError(error);
    return { ok: false, error: "lookup_failed" };
  }
}

export async function findOrders(
  input: OrderSearchInput
): Promise<JerseyOrderLookupResult> {
  if (!normalizeOrderSearch(input)) {
    return { ok: false, error: "invalid_input" };
  }

  try {
    const orders = await readAllNormalizedOrders();

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

async function readAllNormalizedOrders(): Promise<OrderRecord[]> {
  const [googleFormResult, manualOrdersResult] = await Promise.allSettled([
    readSourceOrders(orderSheetSources.googleForm),
    readSourceOrders(orderSheetSources.manualOrders)
  ]);

  if (googleFormResult.status === "rejected") {
    throw new SheetSourceError("google_form", googleFormResult.reason);
  }

  if (manualOrdersResult.status === "rejected") {
    throw new SheetSourceError("manual", manualOrdersResult.reason);
  }

  return [...googleFormResult.value, ...manualOrdersResult.value];
}

async function readSourceOrders(
  source: (typeof orderSheetSources)[keyof typeof orderSheetSources]
): Promise<OrderRecord[]> {
  const rows = await source.readRows();
  const { orders, diagnostics } = source.adaptRows(rows);

  if (
    diagnostics.skippedRows > 0 ||
    diagnostics.malformedMultiJerseyEntries > 0 ||
    diagnostics.unexpectedPaymentStatusValues > 0
  ) {
    console.warn("Google Sheet lookup skipped or normalized source data.", {
      source: source.name,
      skippedRows: diagnostics.skippedRows,
      malformedMultiJerseyEntries: diagnostics.malformedMultiJerseyEntries,
      unexpectedPaymentStatusValues: diagnostics.unexpectedPaymentStatusValues
    });
  }

  return orders;
}

function logOrderLookupError(error: unknown): void {
  if (error instanceof SheetSourceError) {
    console.error("Google Sheet source lookup failed.", {
      source: error.source,
      message:
        error.cause instanceof Error ? error.cause.message : "Unknown source error"
    });
    return;
  }

  if (error instanceof SheetSchemaError) {
    console.error("Google Sheet schema mismatch.", {
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

class SheetSourceError extends Error {
  constructor(
    public readonly source: "google_form" | "manual",
    public override readonly cause: unknown
  ) {
    super(`Google Sheet source failed: ${source}`);
    this.name = "SheetSourceError";
  }
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
