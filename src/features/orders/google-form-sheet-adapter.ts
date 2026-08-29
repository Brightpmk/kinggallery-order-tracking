import type { SheetCellValue, SheetRow } from "@/lib/google-sheets/sheets-client";
import {
  type DeliveryMethod,
  type JerseyColor,
  type JerseySize
} from "./jersey";
import {
  cellToIdentifier,
  createInitialDiagnostics,
  hashStableValue,
  normalizeDisplayText,
  normalizeJerseyColorValue,
  normalizeJerseyNumberValue,
  normalizeJerseySizeValue,
  normalizePrintedNameValue,
  requireHeader as requireSheetHeader,
  SheetSchemaError,
  type AdapterDiagnostics
} from "./sheet-normalization";
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

export type GoogleFormAdapterResult = {
  orders: OrderRecord[];
  diagnostics: AdapterDiagnostics;
};

export function adaptGoogleFormSheetRows(rows: SheetRow[]): GoogleFormAdapterResult {
  const [headerRow, ...dataRows] = rows;

  if (!headerRow) {
    throw new SheetSchemaError("Google Form response sheet is empty.");
  }

  const columns = findGoogleFormColumns(headerRow);
  const diagnostics = createInitialDiagnostics();
  const orders: OrderRecord[] = [];

  dataRows.forEach((row) => {
    const timestamp = cellToIdentifier(row[columns.timestamp]);
    const createdAt = parseSheetTimestamp(timestamp);

    if (!createdAt) {
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
      id: createOrderId(createdAt, items),
      orderCode: createOrderCode(createdAt, items),
      source: "google_form",
      customer: {
        fullName: normalizeDisplayText(row[columns.fullName]) || null,
        phoneNumber: normalizeJerseyNumberValue(row[columns.phoneNumber]) || null
      },
      deliveryMethod: normalizeDeliveryMethod(row[columns.delivery]),
      createdAt,
      updatedAt: createdAt,
      items
    });
  });

  return { orders, diagnostics };
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
    timestamp: requireSheetHeader(headerRow, googleFormHeaders.timestamp),
    fullName: requireSheetHeader(headerRow, googleFormHeaders.fullName),
    phoneNumber: requireSheetHeader(headerRow, googleFormHeaders.phoneNumber),
    color: requireSheetHeader(headerRow, googleFormHeaders.color),
    size: requireSheetHeader(headerRow, googleFormHeaders.size),
    printName: requireSheetHeader(headerRow, googleFormHeaders.printName),
    shirtNumber: requireSheetHeader(headerRow, googleFormHeaders.shirtNumber),
    university: requireSheetHeader(headerRow, googleFormHeaders.university),
    delivery: requireSheetHeader(headerRow, googleFormHeaders.delivery),
    multiJersey: requireSheetHeader(
      headerRow,
      googleFormHeaders.multiJerseyPrefix
    )
  };
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
  const normalizedPrintName = normalizePrintedNameValue(printName);
  const normalizedShirtNumber = normalizeJerseyNumberValue(shirtNumber);
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
    paymentStatus: "paid",
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
  const normalizedValue = normalizeJerseyColorValue(value);
  return normalizedValue === "" ? null : normalizedValue;
}

function normalizeJerseySize(value: string): JerseySize | null {
  const normalizedValue = normalizeJerseySizeValue(value);
  return normalizedValue === "" ? null : normalizedValue;
}

function parseSheetTimestamp(value: string): string | null {
  if (value === "") {
    return null;
  }

  const localDateParts = parseLocalSheetTimestamp(value);

  if (localDateParts) {
    return toBangkokIsoTimestamp(localDateParts);
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toISOString();
}

function parseLocalSheetTimestamp(value: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
} | null {
  const normalizedValue = value.trim();
  const dayFirstMatch = normalizedValue.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/
  );

  if (dayFirstMatch) {
    return {
      day: Number.parseInt(dayFirstMatch[1], 10),
      month: Number.parseInt(dayFirstMatch[2], 10),
      year: Number.parseInt(dayFirstMatch[3], 10),
      hour: Number.parseInt(dayFirstMatch[4], 10),
      minute: Number.parseInt(dayFirstMatch[5], 10),
      second: Number.parseInt(dayFirstMatch[6] ?? "0", 10),
      millisecond: 0
    };
  }

  const yearFirstMatch = normalizedValue.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?$/
  );

  if (!yearFirstMatch) {
    return null;
  }

  return {
    year: Number.parseInt(yearFirstMatch[1], 10),
    month: Number.parseInt(yearFirstMatch[2], 10),
    day: Number.parseInt(yearFirstMatch[3], 10),
    hour: Number.parseInt(yearFirstMatch[4], 10),
    minute: Number.parseInt(yearFirstMatch[5], 10),
    second: Number.parseInt(yearFirstMatch[6] ?? "0", 10),
    millisecond: Number.parseInt((yearFirstMatch[7] ?? "0").slice(0, 3), 10)
  };
}

function toBangkokIsoTimestamp(parts: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}): string | null {
  const bangkokUtcOffsetHours = 7;
  const timestamp = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour - bangkokUtcOffsetHours,
    parts.minute,
    parts.second,
    parts.millisecond
  );

  if (Number.isNaN(timestamp)) {
    return null;
  }

  return new Date(timestamp).toISOString();
}

function createOrderId(
  createdAt: string,
  items: OrderItem[]
): string {
  return `google_form_${hashOrderIdentity(createdAt, items)}`;
}

function createOrderCode(
  createdAt: string,
  items: OrderItem[]
): string {
  const datePrefix = createdAt.slice(0, 10).replace(/-/g, "");
  const hash = hashOrderIdentity(createdAt, items)
    .slice(0, 6)
    .toUpperCase();

  return `KG-${datePrefix}-${hash}`;
}

function hashOrderIdentity(
  createdAt: string,
  items: OrderItem[]
): string {
  const value = `${createdAt}|${items
    .map(
      (item) =>
        `${item.jerseyColor}|${item.jerseySize}|${item.printName}|${item.shirtNumber}|${item.universityAbbreviation}`
    )
    .join(";")}`;
  return hashStableValue(value);
}

function normalizeJerseyIdentityPart(value: string | null): string {
  return normalizeDisplayText(value).toUpperCase();
}
