import { describe, expect, it } from "vitest";
import { SheetSchemaError } from "./sheet-normalization";
import {
  adaptWebsiteOrderSheetRows,
  websiteOrderHeaders,
  websiteOrderItemHeaders
} from "./website-order-sheet-adapter";

const orderHeaderRow = [
  websiteOrderHeaders.orderId,
  websiteOrderHeaders.createdAt,
  websiteOrderHeaders.university,
  websiteOrderHeaders.fullName,
  websiteOrderHeaders.phone,
  websiteOrderHeaders.deliveryMethod,
  websiteOrderHeaders.shippingAddress,
  websiteOrderHeaders.shippingFee,
  websiteOrderHeaders.subtotal,
  websiteOrderHeaders.total,
  websiteOrderHeaders.paymentStatus,
  websiteOrderHeaders.slipFileId,
  websiteOrderHeaders.slipUrl,
  websiteOrderHeaders.orderStatus,
  websiteOrderHeaders.shippingProvider,
  websiteOrderHeaders.trackingNumber,
  websiteOrderHeaders.notes
];

const itemHeaderRow = [
  websiteOrderItemHeaders.orderId,
  websiteOrderItemHeaders.itemId,
  websiteOrderItemHeaders.productId,
  websiteOrderItemHeaders.jerseyColor,
  websiteOrderItemHeaders.size,
  websiteOrderItemHeaders.quantity,
  websiteOrderItemHeaders.unitPrice,
  websiteOrderItemHeaders.lineTotal
];

function buildOrderRow(overrides: Partial<Record<string, string | number>> = {}) {
  const values = {
    orderId: "KG-2026-A8F2B91C",
    createdAt: "2026-08-29T10:00:00.000Z",
    university: "BANGMOD",
    fullName: "Ada Lovelace",
    phone: "081-234-5678",
    deliveryMethod: "SHIPPING",
    shippingAddress: "123 Test Road",
    shippingFee: 50,
    subtotal: 780,
    total: 830,
    paymentStatus: "PENDING",
    slipFileId: "drive-file-123",
    slipUrl: "https://drive.google.com/private-slip",
    orderStatus: "NEW",
    shippingProvider: "EMS",
    trackingNumber: "TH123456789",
    notes: "Private note",
    ...overrides
  };

  return [
    values.orderId,
    values.createdAt,
    values.university,
    values.fullName,
    values.phone,
    values.deliveryMethod,
    values.shippingAddress,
    values.shippingFee,
    values.subtotal,
    values.total,
    values.paymentStatus,
    values.slipFileId,
    values.slipUrl,
    values.orderStatus,
    values.shippingProvider,
    values.trackingNumber,
    values.notes
  ];
}

function buildItemRow(overrides: Partial<Record<string, string | number>> = {}) {
  const values = {
    orderId: "KG-2026-A8F2B91C",
    itemId: "KG-2026-A8F2B91C-01",
    productId: "kg-bm-matcha",
    jerseyColor: "Matcha",
    size: "M",
    quantity: 2,
    unitPrice: 390,
    lineTotal: 780,
    ...overrides
  };

  return [
    values.orderId,
    values.itemId,
    values.productId,
    values.jerseyColor,
    values.size,
    values.quantity,
    values.unitPrice,
    values.lineTotal
  ];
}

describe("Website Order Sheet adapter", () => {
  it("joins one order with one item", () => {
    const { orders, diagnostics } = adaptWebsiteOrderSheetRows(
      [orderHeaderRow, buildOrderRow()],
      [itemHeaderRow, buildItemRow()]
    );

    expect(diagnostics.skippedRows).toBe(0);
    expect(orders).toHaveLength(1);
    expect(orders[0]).toEqual(
      expect.objectContaining({
        orderCode: "KG-2026-A8F2B91C",
        source: "website",
        createdAt: "2026-08-29T10:00:00.000Z",
        orderStatus: "new",
        deliveryMethod: "shipping",
        shippingProvider: "EMS",
        trackingNumber: "TH123456789"
      })
    );
    expect(orders[0].customer).toEqual({
      fullName: "Ada Lovelace",
      phoneNumber: "081-234-5678"
    });
    expect(orders[0].items).toEqual([
      expect.objectContaining({
        productName: "University Jersey Shirt",
        jerseyColor: "Matcha",
        jerseySize: "M",
        printName: null,
        shirtNumber: null,
        universityAbbreviation: "BANGMOD",
        paymentStatus: "pending",
        quantity: 2,
        unitPrice: 390
      })
    ]);
  });

  it("parses template-style Bangkok local timestamps", () => {
    const { orders } = adaptWebsiteOrderSheetRows(
      [orderHeaderRow, buildOrderRow({ createdAt: "2026-08-29 16:30:00" })],
      [itemHeaderRow, buildItemRow()]
    );

    expect(orders[0].createdAt).toBe("2026-08-29T09:30:00.000Z");
  });

  it("joins one order with multiple items", () => {
    const { orders } = adaptWebsiteOrderSheetRows(
      [orderHeaderRow, buildOrderRow()],
      [
        itemHeaderRow,
        buildItemRow(),
        buildItemRow({
          itemId: "KG-2026-A8F2B91C-02",
          productId: "kg-bm-mint",
          jerseyColor: "Mint Chocolate Chip",
          size: "L",
          quantity: 1,
          unitPrice: 420,
          lineTotal: 420
        })
      ]
    );

    expect(orders[0].items).toHaveLength(2);
    expect(orders[0].items.map((item) => item.jerseyColor)).toEqual([
      "Matcha",
      "Mint Chocolate Chip"
    ]);
  });

  it("keeps multiple website orders distinct", () => {
    const { orders } = adaptWebsiteOrderSheetRows(
      [
        orderHeaderRow,
        buildOrderRow(),
        buildOrderRow({
          orderId: "KG-2026-BBBBBBBB",
          createdAt: "2026-08-30T10:00:00.000Z"
        })
      ],
      [
        itemHeaderRow,
        buildItemRow(),
        buildItemRow({
          orderId: "KG-2026-BBBBBBBB",
          itemId: "KG-2026-BBBBBBBB-01"
        })
      ]
    );

    expect(orders.map((order) => order.orderCode)).toEqual([
      "KG-2026-A8F2B91C",
      "KG-2026-BBBBBBBB"
    ]);
  });

  it("ignores orphan OrderItems safely", () => {
    const { orders, diagnostics } = adaptWebsiteOrderSheetRows(
      [orderHeaderRow, buildOrderRow()],
      [itemHeaderRow, buildItemRow({ orderId: "KG-ORPHAN" }), buildItemRow()]
    );

    expect(orders).toHaveLength(1);
    expect(diagnostics.orphanOrderItems).toBe(1);
  });

  it("skips orders with no items", () => {
    const { orders, diagnostics } = adaptWebsiteOrderSheetRows(
      [orderHeaderRow, buildOrderRow()],
      [itemHeaderRow]
    );

    expect(orders).toEqual([]);
    expect(diagnostics.ordersWithoutItems).toBe(1);
  });

  it("keeps the first duplicate ORDER_ID and reports the duplicate", () => {
    const { orders, diagnostics } = adaptWebsiteOrderSheetRows(
      [
        orderHeaderRow,
        buildOrderRow({ fullName: "First Customer" }),
        buildOrderRow({ fullName: "Duplicate Customer" })
      ],
      [itemHeaderRow, buildItemRow()]
    );

    expect(orders).toHaveLength(1);
    expect(orders[0].customer?.fullName).toBe("First Customer");
    expect(diagnostics.duplicateOrderIds).toBe(1);
  });

  it("throws on malformed headers", () => {
    expect(() =>
      adaptWebsiteOrderSheetRows(
        [orderHeaderRow.filter((header) => header !== websiteOrderHeaders.orderId)],
        [itemHeaderRow, buildItemRow()]
      )
    ).toThrow(SheetSchemaError);
  });

  it("maps paid payment status", () => {
    const { orders } = adaptWebsiteOrderSheetRows(
      [orderHeaderRow, buildOrderRow({ paymentStatus: "PAID" })],
      [itemHeaderRow, buildItemRow()]
    );

    expect(orders[0].items[0].paymentStatus).toBe("paid");
  });

  it("does not infer paid from a slip file", () => {
    const { orders } = adaptWebsiteOrderSheetRows(
      [
        orderHeaderRow,
        buildOrderRow({ paymentStatus: "PENDING", slipFileId: "drive-file-123" })
      ],
      [itemHeaderRow, buildItemRow()]
    );

    expect(orders[0].items[0].paymentStatus).toBe("pending");
  });

  it("maps pickup delivery without tracking fields", () => {
    const { orders } = adaptWebsiteOrderSheetRows(
      [
        orderHeaderRow,
        buildOrderRow({
          deliveryMethod: "PICKUP",
          shippingProvider: "",
          trackingNumber: ""
        })
      ],
      [itemHeaderRow, buildItemRow()]
    );

    expect(orders[0].deliveryMethod).toBe("pickup");
    expect(orders[0].shippingProvider).toBeUndefined();
    expect(orders[0].trackingNumber).toBeUndefined();
  });

  it("maps shipping without tracking as unavailable", () => {
    const { orders } = adaptWebsiteOrderSheetRows(
      [orderHeaderRow, buildOrderRow({ trackingNumber: "" })],
      [itemHeaderRow, buildItemRow()]
    );

    expect(orders[0].deliveryMethod).toBe("shipping");
    expect(orders[0].shippingProvider).toBe("EMS");
    expect(orders[0].trackingNumber).toBeUndefined();
  });
});
