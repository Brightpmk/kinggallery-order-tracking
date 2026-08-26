import type { SheetCellValue, SheetRow } from "@/lib/google-sheets/sheets-client";
import {
  jerseyColors,
  jerseySizes,
  type DeliveryMethod,
  type JerseyColor,
  type JerseySize
} from "./jersey";
import type { OrderItem, OrderRecord } from "./types";

const productName = "University Jersey Shirt";
const defaultCurrency = "THB";

export const googleFormHeaders = {
  timestamp: "ประทับเวลา",
  fullName: "ชื่อ-นามสกุล(Full Name)",
  phoneNumber: "เบอร์โทร(Phone number)",
  color: "𝐂𝐇𝐎𝐎𝐒𝐄 𝐘𝐎𝐔𝐑 𝐂𝐎𝐋𝐎𝐔𝐑",
  size: "𝐂𝐇𝐎𝐎𝐒𝐄 𝐘𝐎𝐔𝐑 𝐒𝐈𝐙𝐄",
  printName: "𝐍𝐀𝐌𝐄",
  shirtNumber: "𝐍𝐔𝐌𝐁𝐄𝐑",
  university: "𝐂𝐇𝐎𝐎𝐒𝐄 𝐘𝐎𝐔𝐑 𝐔𝐍𝐈𝐕𝐄𝐑𝐒𝐈𝐓𝐘",
  delivery: "การจัดส่ง",
  multiJerseyPrefix: "หากลูกค้าต้องการสั่งซื้อ 2 ตัวขึ้นไปให้กรอกตามนี้เลยนะคะ"
} as const;

type GoogleFormColumnIndexes = {
  timestamp: number;
  fullName: number;
  phoneNumber: number;
  color: number;
  size: number;
  printName: number;
  shirtNumber: number;
  university: number;
  delivery: number;
  multiJersey: number;
};

export type AdapterDiagnostics = {
  skippedRows: number;
  malformedMultiJerseyEntries: number;
};

export type GoogleFormAdapterResult = {
  orders: OrderRecord[];
  diagnostics: AdapterDiagnostics;
};

export function adaptGoogleFormSheetRows(rows: SheetRow[]): GoogleFormAdapterResult {
  const [headerRow, ...dataRows] = rows;

  if (!headerRow) {
    throw new GoogleFormSheetSchemaError("Google Form response sheet is empty.");
  }

  const columns = findGoogleFormColumns(headerRow);
  const diagnostics: AdapterDiagnostics = {
    skippedRows: 0,
    malformedMultiJerseyEntries: 0
  };
  const orders: OrderRecord[] = [];

  dataRows.forEach((row) => {
    const timestamp = cellToIdentifier(row[columns.timestamp]);
    const customerName = normalizeDisplayText(row[columns.fullName]);
    const phoneNumber = normalizePhoneIdentifier(row[columns.phoneNumber]);
    const createdAt = parseSheetTimestamp(timestamp);

    if (!createdAt || customerName === "" || phoneNumber === "") {
      diagnostics.skippedRows += 1;
      return;
    }

    const firstJersey = parseStructuredJersey(row, columns);

    if (!firstJersey) {
      diagnostics.skippedRows += 1;
      return;
    }

    const multiJerseyParse = parseMultiJerseyField(row[columns.multiJersey]);
    diagnostics.malformedMultiJerseyEntries += multiJerseyParse.malformedEntries;

    const items = mergeStructuredAndAdditionalJerseys(
      firstJersey,
      multiJerseyParse.items
    );

    orders.push({
      id: createOrderId(customerName, phoneNumber, createdAt),
      orderCode: createOrderCode(customerName, phoneNumber, createdAt),
      source: "google_form",
      deliveryMethod: normalizeDeliveryMethod(row[columns.delivery]),
      createdAt,
      updatedAt: createdAt,
      status: "pending",
      customerName,
      phoneNumber,
      items,
      timeline: [
        {
          status: "pending",
          occurredAt: createdAt,
          note: "Order received."
        }
      ]
    });
  });

  return { orders, diagnostics };
}

export class GoogleFormSheetSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleFormSheetSchemaError";
  }
}

export function parseMultiJerseyField(value: SheetCellValue): {
  items: OrderItem[];
  malformedEntries: number;
} {
  const text = cellToIdentifier(value);

  if (text === "" || text === "-") {
    return { items: [], malformedEntries: 0 };
  }

  return splitMultiJerseyEntries(text).reduce(
    (result, entry) => {
      const item = parseJerseyParts(entry);

      if (!item) {
        result.malformedEntries += 1;
        return result;
      }

      result.items.push(item);
      return result;
    },
    { items: [] as OrderItem[], malformedEntries: 0 }
  );
}

export function areSameJersey(first: OrderItem, second: OrderItem): boolean {
  return (
    normalizeJerseyIdentityPart(first.jerseyColor) ===
      normalizeJerseyIdentityPart(second.jerseyColor) &&
    normalizeJerseyIdentityPart(first.jerseySize) ===
      normalizeJerseyIdentityPart(second.jerseySize) &&
    normalizeJerseyIdentityPart(first.printName) ===
      normalizeJerseyIdentityPart(second.printName) &&
    normalizeJerseyIdentityPart(first.shirtNumber) ===
      normalizeJerseyIdentityPart(second.shirtNumber) &&
    normalizeJerseyIdentityPart(first.universityAbbreviation) ===
      normalizeJerseyIdentityPart(second.universityAbbreviation)
  );
}

function findGoogleFormColumns(headerRow: SheetRow): GoogleFormColumnIndexes {
  return {
    timestamp: requireHeader(headerRow, googleFormHeaders.timestamp),
    fullName: requireHeader(headerRow, googleFormHeaders.fullName),
    phoneNumber: requireHeader(headerRow, googleFormHeaders.phoneNumber),
    color: requireHeader(headerRow, googleFormHeaders.color),
    size: requireHeader(headerRow, googleFormHeaders.size),
    printName: requireHeader(headerRow, googleFormHeaders.printName),
    shirtNumber: requireHeader(headerRow, googleFormHeaders.shirtNumber),
    university: requireHeader(headerRow, googleFormHeaders.university),
    delivery: requireHeader(headerRow, googleFormHeaders.delivery),
    multiJersey: requireHeader(headerRow, googleFormHeaders.multiJerseyPrefix)
  };
}

function requireHeader(headerRow: SheetRow, expectedHeader: string): number {
  const expected = normalizeHeader(expectedHeader);
  const index = headerRow.findIndex((header) =>
    normalizeHeader(header).startsWith(expected)
  );

  if (index === -1) {
    throw new GoogleFormSheetSchemaError(
      `Missing required Google Form Sheet column: ${expectedHeader}`
    );
  }

  return index;
}

function normalizeHeader(value: SheetCellValue): string {
  return cellToIdentifier(value).replace(/\s+/g, " ").trim();
}

function parseStructuredJersey(
  row: SheetRow,
  columns: GoogleFormColumnIndexes
): OrderItem | null {
  return parseJerseyParts(
    [
      row[columns.color],
      row[columns.size],
      row[columns.printName],
      row[columns.shirtNumber],
      row[columns.university]
    ]
      .map(cellToIdentifier)
      .join("/")
  );
}

function parseJerseyParts(value: string): OrderItem | null {
  const parts = value
    .replace(/\uFF0F/g, "/")
    .replace(/^\s*\d+\s*[.)]\s*/, "")
    .split("/")
    .map((part) => normalizeDisplayText(part));

  if (parts.length < 5) {
    return null;
  }

  const [color, size, printName, shirtNumber, university] = parts;
  const normalizedColor = normalizeJerseyColor(color);
  const normalizedSize = normalizeJerseySize(size);
  const normalizedPrintName = normalizeDisplayText(printName).toUpperCase();
  const normalizedShirtNumber = normalizeIdentifier(shirtNumber);
  const normalizedUniversity = normalizeDisplayText(university).toUpperCase();

  if (
    !normalizedColor ||
    !normalizedSize ||
    normalizedPrintName === "" ||
    normalizedShirtNumber === "" ||
    normalizedUniversity === ""
  ) {
    return null;
  }

  return {
    productName,
    jerseyColor: normalizedColor,
    jerseySize: normalizedSize,
    printName: normalizedPrintName,
    shirtNumber: normalizedShirtNumber,
    universityAbbreviation: normalizedUniversity,
    quantity: 1,
    unitPrice: null,
    currency: defaultCurrency
  };
}

function splitMultiJerseyEntries(value: string): string[] {
  const text = value.replace(/\r\n?/g, "\n").trim();
  const numberedEntryPattern = /(?:^|[\n,])\s*\d+\s*[.)]\s*/g;
  const matches = [...text.matchAll(numberedEntryPattern)];

  if (matches.length === 0) {
    return text
      .split(/\n+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return matches
    .map((match, index) => {
      const start = (match.index ?? 0) + match[0].length;
      const end =
        index + 1 < matches.length ? matches[index + 1].index ?? text.length : text.length;

      return text
        .slice(start, end)
        .replace(/^[,\s]+|[,\s]+$/g, "")
        .trim();
    })
    .filter(Boolean);
}

function mergeStructuredAndAdditionalJerseys(
  firstJersey: OrderItem,
  additionalJerseys: OrderItem[]
): OrderItem[] {
  const items = [firstJersey];
  let skippedRepeatedFirstJersey = false;

  additionalJerseys.forEach((item) => {
    if (!skippedRepeatedFirstJersey && areSameJersey(firstJersey, item)) {
      skippedRepeatedFirstJersey = true;
      return;
    }

    items.push(item);
  });

  return items;
}

function normalizeDeliveryMethod(value: SheetCellValue): DeliveryMethod {
  const deliveryText = normalizeDisplayText(value);
  return deliveryText.includes("ส่ง") ? "shipping" : "pickup";
}

function normalizeJerseyColor(value: string): JerseyColor | null {
  const normalizedValue = normalizeDisplayText(value).toUpperCase();
  return jerseyColors.find((color) => color === normalizedValue) ?? null;
}

function normalizeJerseySize(value: string): JerseySize | null {
  const normalizedValue = normalizeDisplayText(value)
    .toUpperCase()
    .replace(/\+.*/, "");

  return jerseySizes.find((size) => size === normalizedValue) ?? null;
}

function parseSheetTimestamp(value: string): string | null {
  if (value === "") {
    return null;
  }

  const isoLikeValue = value.replace(" ", "T").replace(/(\.\d{3})\d+$/, "$1");
  const parsedDate = new Date(isoLikeValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString();
}

function createOrderId(
  customerName: string,
  phoneNumber: string,
  createdAt: string
): string {
  return `google_form_${hashOrderIdentity(customerName, phoneNumber, createdAt)}`;
}

function createOrderCode(
  customerName: string,
  phoneNumber: string,
  createdAt: string
): string {
  const datePrefix = createdAt.slice(0, 10).replace(/-/g, "");
  const hash = hashOrderIdentity(customerName, phoneNumber, createdAt)
    .slice(0, 6)
    .toUpperCase();

  return `KG-${datePrefix}-${hash}`;
}

function hashOrderIdentity(
  customerName: string,
  phoneNumber: string,
  createdAt: string
): string {
  const value = `${customerName}|${phoneNumber}|${createdAt}`;
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36);
}

function normalizeJerseyIdentityPart(value: string | null): string {
  return normalizeDisplayText(value).toUpperCase();
}

function normalizeDisplayText(value: SheetCellValue): string {
  return cellToIdentifier(value).replace(/\s+/g, " ").trim();
}

function normalizePhoneIdentifier(value: SheetCellValue): string {
  return normalizeIdentifier(value).replace(/\D/g, "");
}

function normalizeIdentifier(value: SheetCellValue): string {
  return cellToIdentifier(value).replace(/^\s+|\s+$/g, "").replace(/\.0+$/, "");
}

function cellToIdentifier(value: SheetCellValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}
