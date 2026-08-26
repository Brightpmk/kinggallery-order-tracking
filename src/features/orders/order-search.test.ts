import { describe, expect, it } from "vitest";
import type { OrderRecord } from "./types";
import { searchOrders } from "./order-search";

const baseOrder = {
  id: "ord_001",
  orderCode: "KG-20260723-ABC123",
  source: "google_form",
  deliveryMethod: "shipping",
  createdAt: "2026-07-23T03:15:48.530Z",
  updatedAt: "2026-07-23T03:15:48.530Z",
  status: "pending",
  customerName: "Bright Example",
  phoneNumber: "0960969594",
  trackingNumber: undefined,
  shippingProvider: undefined,
  timeline: [],
  items: [
    {
      productName: "University Jersey Shirt",
      jerseyColor: "IGNITE RED",
      jerseySize: "XL",
      printName: "BRIGHT",
      shirtNumber: "67",
      universityAbbreviation: "KMUTT",
      quantity: 1,
      unitPrice: null,
      currency: "THB"
    },
    {
      productName: "University Jersey Shirt",
      jerseyColor: "SONIC BLUE",
      jerseySize: "L",
      printName: "BRIGHT",
      shirtNumber: "21",
      universityAbbreviation: "KMUTT",
      quantity: 1,
      unitPrice: null,
      currency: "THB"
    }
  ]
} satisfies OrderRecord;

const otherOrder = {
  ...baseOrder,
  id: "ord_002",
  orderCode: "KG-20260724-DEF456",
  createdAt: "2026-07-24T03:15:48.530Z",
  updatedAt: "2026-07-24T03:15:48.530Z",
  customerName: "Another Customer",
  phoneNumber: "0811111111",
  items: [baseOrder.items[0]]
} satisfies OrderRecord;

describe("order search", () => {
  it("finds a customer by full name and returns all jerseys", () => {
    const result = searchOrders([baseOrder], {
      mode: "customer",
      type: "name",
      value: " bright   example "
    });

    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(2);
  });

  it("finds a customer by phone and returns all jerseys", () => {
    const result = searchOrders([baseOrder], {
      mode: "customer",
      type: "phone",
      value: "096-096-9594"
    });

    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(2);
  });

  it("returns multiple matching customer records instead of selecting one", () => {
    const result = searchOrders([baseOrder, { ...otherOrder, customerName: "Bright Example" }], {
      mode: "customer",
      type: "name",
      value: "Bright Example"
    });

    expect(result).toHaveLength(2);
  });

  it("requires printed name and jersey number for jersey search", () => {
    expect(
      searchOrders([baseOrder], {
        mode: "jersey",
        printName: "BRIGHT",
        shirtNumber: ""
      })
    ).toEqual([]);
  });

  it("finds the structured first jersey", () => {
    const result = searchOrders([baseOrder], {
      mode: "jersey",
      printName: "bright",
      shirtNumber: "67"
    });

    expect(result[0].items).toEqual([
      expect.objectContaining({
        jerseyColor: "IGNITE RED",
        shirtNumber: "67"
      })
    ]);
  });

  it("finds a parsed additional jersey and returns only that matching item", () => {
    const result = searchOrders([baseOrder], {
      mode: "jersey",
      printName: "BRIGHT",
      shirtNumber: "21"
    });

    expect(result).toHaveLength(1);
    expect(result[0].items).toEqual([
      expect.objectContaining({
        jerseyColor: "SONIC BLUE",
        shirtNumber: "21"
      })
    ]);
  });
});
