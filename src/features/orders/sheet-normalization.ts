import type { SheetCellValue, SheetRow } from "@/lib/google-sheets/sheets-client";
import { knownJerseyColorSwatches } from "./jersey";
import type { PaymentStatus } from "./types";

export type AdapterDiagnostics = {
  skippedRows: number;
  malformedMultiJerseyEntries: number;
  orphanOrderItems: number;
  duplicateOrderIds: number;
  ordersWithoutItems: number;
  unexpectedPaymentStatusValues: number;
  unexpectedOrderStatusValues: number;
};

export function createInitialDiagnostics(): AdapterDiagnostics {
  return {
    skippedRows: 0,
    malformedMultiJerseyEntries: 0,
    orphanOrderItems: 0,
    duplicateOrderIds: 0,
    ordersWithoutItems: 0,
    unexpectedPaymentStatusValues: 0,
    unexpectedOrderStatusValues: 0
  };
}

export function requireHeader(
  headerRow: SheetRow,
  expectedHeader: string
): number {
  const expected = normalizeHeader(expectedHeader);
  const index = headerRow.findIndex((header) =>
    normalizeHeader(header).startsWith(expected)
  );

  if (index === -1) {
    throw new SheetSchemaError(
      `Missing required Google Sheet column: ${expectedHeader}`
    );
  }

  return index;
}

export function requireAnyHeader(
  headerRow: SheetRow,
  expectedHeaders: readonly string[]
): number {
  const index = expectedHeaders
    .map((header) => requireOptionalHeader(headerRow, header))
    .find((headerIndex) => headerIndex !== -1);

  if (index === undefined) {
    throw new SheetSchemaError(
      `Missing required Google Sheet column: ${expectedHeaders.join(" or ")}`
    );
  }

  return index;
}

export function normalizeDisplayText(value: SheetCellValue): string {
  return cellToIdentifier(value).replace(/\s+/g, " ").trim();
}

export function normalizeHeader(value: SheetCellValue): string {
  return normalizeDisplayText(value).toUpperCase();
}

export function normalizeIdentifier(value: SheetCellValue): string {
  return cellToIdentifier(value).replace(/^\s+|\s+$/g, "").replace(/\.0+$/, "");
}

export function normalizePrintedNameValue(value: SheetCellValue): string {
  return normalizeDisplayText(value).toUpperCase();
}

export function normalizeJerseyNumberValue(value: SheetCellValue): string {
  return normalizeIdentifier(value).replace(/\s+/g, " ");
}

export function normalizeJerseyColorValue(value: SheetCellValue): string {
  const normalizedValue = normalizeDisplayText(value);
  const knownColor = knownJerseyColorSwatches[normalizedValue.toUpperCase()];

  return knownColor ? normalizedValue.toUpperCase() : normalizedValue;
}

export function normalizeJerseySizeValue(value: SheetCellValue): string {
  return normalizeDisplayText(value).toUpperCase().replace(/\+.*/, "");
}

export function normalizePaymentStatusValue(value: SheetCellValue): {
  paymentStatus: PaymentStatus;
  unexpectedValue: boolean;
} {
  const normalizedValue = normalizeDisplayText(value).toUpperCase();

  if (normalizedValue === "PAID") {
    return { paymentStatus: "paid", unexpectedValue: false };
  }

  if (normalizedValue === "") {
    return { paymentStatus: "unpaid", unexpectedValue: false };
  }

  return { paymentStatus: "unpaid", unexpectedValue: true };
}

export function hashStableValue(value: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36);
}

export function cellToIdentifier(value: SheetCellValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

export class SheetSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SheetSchemaError";
  }
}

function requireOptionalHeader(headerRow: SheetRow, expectedHeader: string): number {
  const expected = normalizeHeader(expectedHeader);
  return headerRow.findIndex((header) => normalizeHeader(header) === expected);
}
