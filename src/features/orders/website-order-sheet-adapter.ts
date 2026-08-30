import type { SheetCellValue, SheetRow } from "@/lib/google-sheets/sheets-client";
import type { DeliveryMethod } from "./jersey";
import {
  cellToIdentifier,
  createInitialDiagnostics,
  hashStableValue,
  normalizeDisplayText,
  normalizeIdentifier,
  normalizeJerseyColorValue,
  normalizeJerseySizeValue,
  requireHeader,
  SheetSchemaError,
  type AdapterDiagnostics
} from "./sheet-normalization";
import type { OrderItem, OrderRecord, OrderStatus, PaymentStatus } from "./types";

const productName = "University Jersey Shirt";
const defaultCurrency = "THB";

export const websiteOrderHeaders = {
  orderId: "ORDER_ID",
  createdAt: "CREATED_AT",
  university: "UNIVERSITY",
  fullName: "FULL_NAME",
  phone: "PHONE",
  deliveryMethod: "DELIVERY_METHOD",
  shippingAddress: "SHIPPING_ADDRESS",
  shippingFee: "SHIPPING_FEE",
  subtotal: "SUBTOTAL",
  total: "TOTAL",
  paymentStatus: "PAYMENT_STATUS",
  slipFileId: "SLIP_FILE_ID",
  slipUrl: "SLIP_URL",
  orderStatus: "ORDER_STATUS",
  shippingProvider: "SHIPPING_PROVIDER",
  trackingNumber: "TRACKING_NUMBER",
  notes: "NOTES"
} as const;

export const websiteOrderItemHeaders = {
  orderId: "ORDER_ID",
  itemId: "ITEM_ID",
  productId: "PRODUCT_ID",
  jerseyColor: "JERSEY_COLOR",
  size: "SIZE",
  quantity: "QUANTITY",
  unitPrice: "UNIT_PRICE",
  lineTotal: "LINE_TOTAL"
} as const;

type WebsiteOrderColumnIndexes = {
  orderId: number;
  createdAt: number;
  university: number;
  fullName: number;
  phone: number;
  deliveryMethod: number;
  paymentStatus: number;
  orderStatus: number;
  shippingProvider: number;
  trackingNumber: number;
};

type WebsiteOrderItemColumnIndexes = {
  orderId: number;
  jerseyColor: number;
  size: number;
  quantity: number;
  unitPrice: number;
};

type WebsiteOrderDraft = {
  order: OrderRecord;
  paymentStatus: PaymentStatus;
  universityAbbreviation: string | null;
};

export type WebsiteOrderAdapterResult = {
  orders: OrderRecord[];
  diagnostics: AdapterDiagnostics;
};

export function adaptWebsiteOrderSheetRows(
  orderRows: SheetRow[],
  orderItemRows: SheetRow[]
): WebsiteOrderAdapterResult {
  const [orderHeaderRow, ...orderDataRows] = orderRows;
  const [orderItemHeaderRow, ...orderItemDataRows] = orderItemRows;

  if (!orderHeaderRow) {
    throw new SheetSchemaError("Website Orders sheet is empty.");
  }

  if (!orderItemHeaderRow) {
    throw new SheetSchemaError("Website OrderItems sheet is empty.");
  }

  const orderColumns = findWebsiteOrderColumns(orderHeaderRow);
  const orderItemColumns = findWebsiteOrderItemColumns(orderItemHeaderRow);
  const diagnostics = createInitialDiagnostics();
  const orderDrafts = new Map<string, WebsiteOrderDraft>();

  orderDataRows.forEach((row) => {
    const draft = parseWebsiteOrder(row, orderColumns, diagnostics);

    if (!draft) {
      diagnostics.skippedRows += 1;
      return;
    }

    if (orderDrafts.has(draft.order.orderCode)) {
      diagnostics.duplicateOrderIds += 1;
      return;
    }

    orderDrafts.set(draft.order.orderCode, draft);
  });

  orderItemDataRows.forEach((row) => {
    const orderId = normalizeIdentifier(row[orderItemColumns.orderId]);
    const draft = orderDrafts.get(orderId);

    if (!draft) {
      diagnostics.orphanOrderItems += 1;
      return;
    }

    const item = parseWebsiteOrderItem(row, orderItemColumns, draft);

    if (!item) {
      diagnostics.skippedRows += 1;
      return;
    }

    draft.order.items.push(item);
  });

  const orders = [...orderDrafts.values()]
    .filter((draft) => {
      if (draft.order.items.length === 0) {
        diagnostics.ordersWithoutItems += 1;
        return false;
      }

      return true;
    })
    .map((draft) => draft.order);

  return { orders, diagnostics };
}

function findWebsiteOrderColumns(headerRow: SheetRow): WebsiteOrderColumnIndexes {
  return {
    orderId: requireHeader(headerRow, websiteOrderHeaders.orderId),
    createdAt: requireHeader(headerRow, websiteOrderHeaders.createdAt),
    university: requireHeader(headerRow, websiteOrderHeaders.university),
    fullName: requireHeader(headerRow, websiteOrderHeaders.fullName),
    phone: requireHeader(headerRow, websiteOrderHeaders.phone),
    deliveryMethod: requireHeader(headerRow, websiteOrderHeaders.deliveryMethod),
    paymentStatus: requireHeader(headerRow, websiteOrderHeaders.paymentStatus),
    orderStatus: requireHeader(headerRow, websiteOrderHeaders.orderStatus),
    shippingProvider: requireHeader(headerRow, websiteOrderHeaders.shippingProvider),
    trackingNumber: requireHeader(headerRow, websiteOrderHeaders.trackingNumber)
  };
}

function findWebsiteOrderItemColumns(
  headerRow: SheetRow
): WebsiteOrderItemColumnIndexes {
  return {
    orderId: requireHeader(headerRow, websiteOrderItemHeaders.orderId),
    jerseyColor: requireHeader(headerRow, websiteOrderItemHeaders.jerseyColor),
    size: requireHeader(headerRow, websiteOrderItemHeaders.size),
    quantity: requireHeader(headerRow, websiteOrderItemHeaders.quantity),
    unitPrice: requireHeader(headerRow, websiteOrderItemHeaders.unitPrice)
  };
}

function parseWebsiteOrder(
  row: SheetRow,
  columns: WebsiteOrderColumnIndexes,
  diagnostics: AdapterDiagnostics
): WebsiteOrderDraft | null {
  const orderId = normalizeIdentifier(row[columns.orderId]);
  const fullName = normalizeDisplayText(row[columns.fullName]);
  const phoneNumber = normalizeIdentifier(row[columns.phone]);

  if (orderId === "" || (fullName === "" && phoneNumber === "")) {
    return null;
  }

  const paymentStatus = normalizeWebsitePaymentStatus(
    row[columns.paymentStatus]
  );
  const orderStatus = normalizeWebsiteOrderStatus(row[columns.orderStatus]);

  if (paymentStatus.unexpectedValue) {
    diagnostics.unexpectedPaymentStatusValues += 1;
  }

  if (orderStatus.unexpectedValue) {
    diagnostics.unexpectedOrderStatusValues += 1;
  }

  const deliveryMethod = normalizeWebsiteDeliveryMethod(
    row[columns.deliveryMethod]
  );
  const shippingProvider = normalizeDisplayText(row[columns.shippingProvider]);
  const trackingNumber = normalizeIdentifier(row[columns.trackingNumber]);
  const universityAbbreviation = normalizeDisplayText(
    row[columns.university]
  ).toUpperCase();

  return {
    order: {
      id: `website_${hashStableValue(orderId)}`,
      orderCode: orderId,
      source: "website",
      customer: {
        fullName,
        phoneNumber
      },
      orderStatus: orderStatus.orderStatus,
      deliveryMethod,
      createdAt: normalizeWebsiteTimestamp(row[columns.createdAt]),
      items: [],
      shippingProvider: shippingProvider || undefined,
      trackingNumber: trackingNumber || undefined
    },
    paymentStatus: paymentStatus.paymentStatus,
    universityAbbreviation: universityAbbreviation || null
  };
}

function parseWebsiteOrderItem(
  row: SheetRow,
  columns: WebsiteOrderItemColumnIndexes,
  draft: WebsiteOrderDraft
): OrderItem | null {
  const jerseyColor = normalizeJerseyColorValue(row[columns.jerseyColor]);
  const jerseySize = normalizeJerseySizeValue(row[columns.size]);
  const quantity = parsePositiveInteger(row[columns.quantity]);

  if (jerseyColor === "" || jerseySize === "" || quantity === null) {
    return null;
  }

  return {
    productName,
    jerseyColor,
    jerseySize,
    printName: null,
    shirtNumber: null,
    universityAbbreviation: draft.universityAbbreviation,
    paymentStatus: draft.paymentStatus,
    quantity,
    unitPrice: parseMoney(row[columns.unitPrice]),
    currency: defaultCurrency
  };
}

function normalizeWebsitePaymentStatus(value: SheetCellValue): {
  paymentStatus: PaymentStatus;
  unexpectedValue: boolean;
} {
  const normalizedValue = normalizeDisplayText(value).toUpperCase();

  if (normalizedValue === "PAID") {
    return { paymentStatus: "paid", unexpectedValue: false };
  }

  if (normalizedValue === "UNPAID") {
    return { paymentStatus: "unpaid", unexpectedValue: false };
  }

  if (normalizedValue === "" || normalizedValue === "PENDING") {
    return { paymentStatus: "pending", unexpectedValue: false };
  }

  return { paymentStatus: "pending", unexpectedValue: true };
}

function normalizeWebsiteOrderStatus(value: SheetCellValue): {
  orderStatus: OrderStatus;
  unexpectedValue: boolean;
} {
  const normalizedValue = normalizeDisplayText(value).toUpperCase();

  if (normalizedValue === "") {
    return { orderStatus: "unknown", unexpectedValue: false };
  }

  if (normalizedValue === "NEW") {
    return { orderStatus: "new", unexpectedValue: false };
  }

  if (normalizedValue === "PENDING") {
    return { orderStatus: "pending", unexpectedValue: false };
  }

  if (normalizedValue === "CONFIRMED") {
    return { orderStatus: "confirmed", unexpectedValue: false };
  }

  if (["PREPARING", "PROCESSING", "IN_PROGRESS"].includes(normalizedValue)) {
    return { orderStatus: "preparing", unexpectedValue: false };
  }

  if (normalizedValue === "SHIPPED") {
    return { orderStatus: "shipped", unexpectedValue: false };
  }

  if (normalizedValue === "DELIVERED") {
    return { orderStatus: "delivered", unexpectedValue: false };
  }

  if (normalizedValue === "CANCELLED" || normalizedValue === "CANCELED") {
    return { orderStatus: "cancelled", unexpectedValue: false };
  }

  return { orderStatus: "unknown", unexpectedValue: true };
}

function normalizeWebsiteDeliveryMethod(
  value: SheetCellValue
): DeliveryMethod | undefined {
  const normalizedValue = normalizeDisplayText(value).toUpperCase();

  if (normalizedValue === "PICKUP") {
    return "pickup";
  }

  if (normalizedValue === "SHIPPING") {
    return "shipping";
  }

  return undefined;
}

function normalizeWebsiteTimestamp(value: SheetCellValue): string | undefined {
  const text = cellToIdentifier(value).trim();

  if (text === "") {
    return undefined;
  }

  const localDateParts = parseLocalWebsiteTimestamp(text);

  if (localDateParts) {
    return toBangkokIsoTimestamp(localDateParts);
  }

  const parsedDate = new Date(text);

  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate.toISOString();
}

function parseLocalWebsiteTimestamp(value: string): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} | null {
  const match = value.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/
  );

  if (!match) {
    return null;
  }

  return {
    year: Number.parseInt(match[1], 10),
    month: Number.parseInt(match[2], 10),
    day: Number.parseInt(match[3], 10),
    hour: Number.parseInt(match[4], 10),
    minute: Number.parseInt(match[5], 10),
    second: Number.parseInt(match[6] ?? "0", 10)
  };
}

function toBangkokIsoTimestamp(parts: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}): string | undefined {
  const bangkokUtcOffsetHours = 7;
  const timestamp = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour - bangkokUtcOffsetHours,
    parts.minute,
    parts.second
  );

  if (Number.isNaN(timestamp)) {
    return undefined;
  }

  return new Date(timestamp).toISOString();
}

function parsePositiveInteger(value: SheetCellValue): number | null {
  const parsedValue = Number.parseInt(cellToIdentifier(value).trim(), 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
}

function parseMoney(value: SheetCellValue): number | null {
  const parsedValue = Number.parseFloat(
    cellToIdentifier(value).replace(/,/g, "").trim()
  );

  return Number.isFinite(parsedValue) ? parsedValue : null;
}
