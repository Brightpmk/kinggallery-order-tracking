import type { SheetRow } from "@/lib/google-sheets/sheets-client";
import {
  createInitialDiagnostics,
  hashStableValue,
  normalizeDisplayText,
  normalizeJerseyColorValue,
  normalizeJerseyNumberValue,
  normalizeJerseySizeValue,
  normalizePaymentStatusValue,
  normalizePrintedNameValue,
  requireAnyHeader,
  requireHeader,
  SheetSchemaError,
  type AdapterDiagnostics
} from "./sheet-normalization";
import type { OrderItem, OrderRecord } from "./types";

const productName = "University Jersey Shirt";
const defaultCurrency = "THB";

const manualOrderHeaders = {
  sequence: [
    "ลำดับ",
    "SEQUENCE",
    "ORDER",
    "ORDER NO",
    "ORDER NUMBER",
    "NO",
    "NO.",
    "#"
  ],
  color: "COLOR",
  printName: "NAME",
  shirtNumber: "NUMBER",
  size: "SIZE",
  university: "UNIVERSITY",
  paymentStatus: "PAYMENT STATUS"
} as const;

type ManualOrderColumnIndexes = {
  sequence: number;
  color: number;
  printName: number;
  shirtNumber: number;
  size: number;
  university: number;
  paymentStatus: number;
};

export type ManualOrderAdapterResult = {
  orders: OrderRecord[];
  diagnostics: AdapterDiagnostics;
};

export function adaptManualOrderSheetRows(
  rows: SheetRow[]
): ManualOrderAdapterResult {
  const [headerRow, ...dataRows] = rows;

  if (!headerRow) {
    throw new SheetSchemaError("Manual order sheet is empty.");
  }

  const columns = findManualOrderColumns(headerRow);
  const diagnostics = createInitialDiagnostics();
  const orders: OrderRecord[] = [];

  dataRows.forEach((row) => {
    const sequence = normalizeDisplayText(row[columns.sequence]);
    const item = parseManualOrderItem(row, columns);

    if (!item || sequence === "") {
      diagnostics.skippedRows += 1;
      return;
    }

    const paymentStatus = normalizePaymentStatusValue(
      row[columns.paymentStatus]
    );

    if (paymentStatus.unexpectedValue) {
      diagnostics.unexpectedPaymentStatusValues += 1;
    }

    item.paymentStatus = paymentStatus.paymentStatus;

    const stableRecordHash = hashStableValue(sequence);

    orders.push({
      id: `manual_${stableRecordHash}`,
      orderCode: `KG-${stableRecordHash.slice(0, 8).toUpperCase()}`,
      source: "manual",
      items: [item]
    });
  });

  return { orders, diagnostics };
}

function findManualOrderColumns(headerRow: SheetRow): ManualOrderColumnIndexes {
  return {
    sequence: requireAnyHeader(headerRow, manualOrderHeaders.sequence),
    color: requireHeader(headerRow, manualOrderHeaders.color),
    printName: requireHeader(headerRow, manualOrderHeaders.printName),
    shirtNumber: requireHeader(headerRow, manualOrderHeaders.shirtNumber),
    size: requireHeader(headerRow, manualOrderHeaders.size),
    university: requireHeader(headerRow, manualOrderHeaders.university),
    paymentStatus: requireHeader(headerRow, manualOrderHeaders.paymentStatus)
  };
}

function parseManualOrderItem(
  row: SheetRow,
  columns: ManualOrderColumnIndexes
): OrderItem | null {
  const jerseyColor = normalizeJerseyColorValue(row[columns.color]);
  const jerseySize = normalizeJerseySizeValue(row[columns.size]);
  const printName = normalizePrintedNameValue(row[columns.printName]);
  const shirtNumber = normalizeJerseyNumberValue(row[columns.shirtNumber]);
  const universityAbbreviation = normalizeDisplayText(
    row[columns.university]
  ).toUpperCase();

  if (
    jerseyColor === "" ||
    jerseySize === "" ||
    printName === "" ||
    shirtNumber === "" ||
    universityAbbreviation === ""
  ) {
    return null;
  }

  return {
    productName,
    jerseyColor,
    jerseySize,
    printName,
    shirtNumber,
    universityAbbreviation,
    paymentStatus: "unpaid",
    quantity: 1,
    unitPrice: null,
    currency: defaultCurrency
  };
}
