import { describe, expect, it } from "vitest";
import { adaptGoogleFormSheetRows, googleFormHeaders } from "./google-form-sheet-adapter";
import { adaptManualOrderSheetRows } from "./manual-order-sheet-adapter";
import { searchCustomerOrders, searchJerseyOrders, searchOrders } from "./order-search";
import type { OrderRecord } from "./types";

const formHeaderRow = [
  googleFormHeaders.timestamp,
  googleFormHeaders.fullName,
  googleFormHeaders.phoneNumber,
  "อีเมล(E-mail)",
  "ช่องทางการติดต่อ(ID Line/Instagram/Facebook)",
  googleFormHeaders.color,
  `${googleFormHeaders.size} `,
  googleFormHeaders.printName,
  googleFormHeaders.shirtNumber,
  googleFormHeaders.university,
  "หลักฐานการโอนเงิน",
  "วันที่ในการโอนเงิน",
  "เวลาในการโอนเงิน",
  "ที่อยู่อีเมล",
  googleFormHeaders.delivery,
  "ที่อยู่สำหรับการจัดส่ง",
  googleFormHeaders.multiJerseyPrefix
];

function buildFormRows() {
  return [
    formHeaderRow,
    [
      "20/7/2026, 19:09:08",
      "Private Customer",
      "0960969594",
      "private@example.com",
      "line-private",
      "IGNITE RED",
      "XL",
      "bright",
      "67",
      "KMUTT",
      "https://drive.google.com/payment-slip",
      "",
      "",
      "private@example.com",
      "นัดรับที่มหาวิทยาลัยพระจอมเกล้าธนบุรี",
      "private address",
      "1. IGNITE RED/XL/bright/67/KMUTT\n2. SONIC BLUE/L/BRIGHT/21/KMUTT"
    ]
  ];
}

function buildMultiOrderFormRows() {
  return [
    formHeaderRow,
    [
      "20/7/2026, 19:09:08",
      " Private   Customer ",
      "096-096-9594",
      "private@example.com",
      "line-private",
      "IGNITE RED",
      "XL",
      "bright",
      "67",
      "KMUTT",
      "https://drive.google.com/payment-slip",
      "",
      "",
      "private@example.com",
      "นัดรับที่มหาวิทยาลัยพระจอมเกล้าธนบุรี",
      "private address",
      "1. IGNITE RED/XL/bright/67/KMUTT\n2. SONIC BLUE/L/BRIGHT/21/KMUTT"
    ],
    [
      "21/7/2026, 08:00:00",
      "private customer",
      "096 096 9594",
      "private@example.com",
      "line-private",
      "SHADOW BLACK",
      "M",
      "PC",
      "10",
      "KMUTT",
      "https://drive.google.com/another-slip",
      "",
      "",
      "private@example.com",
      "นัดรับที่มหาวิทยาลัยพระจอมเกล้าธนบุรี",
      "another private address",
      ""
    ]
  ];
}

function buildManualRows() {
  return [
    ["ORDER NUMBER", "COLOR", "NAME", "NUMBER", "SIZE", "UNIVERSITY", "PAYMENT STATUS"],
    ["42", "Matcha", " bright ", "67", "XL", "KMUTT", "PAID"],
    ["43", "Mint chocolate chip", "BRIGHT", "67", "L", "KMUTT", ""]
  ];
}

describe("jersey order search", () => {
  it("finds old Google Form orders by full customer name", () => {
    const { orders } = adaptGoogleFormSheetRows(buildFormRows());
    const result = searchCustomerOrders(orders, {
      fullName: " private   customer ",
      phoneNumber: ""
    });

    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(2);
  });

  it("finds old Google Form orders by formatted phone number", () => {
    const { orders } = adaptGoogleFormSheetRows(buildMultiOrderFormRows());
    const result = searchCustomerOrders(orders, {
      fullName: "",
      phoneNumber: "096 096-9594"
    });

    expect(result).toHaveLength(2);
    expect(result.flatMap((order) => order.items)).toHaveLength(3);
  });

  it("matches customer name or phone number without requiring both", () => {
    const { orders } = adaptGoogleFormSheetRows(buildFormRows());
    const result = searchCustomerOrders(orders, {
      fullName: "Wrong Customer",
      phoneNumber: "096-096-9594"
    });

    expect(result).toHaveLength(1);
  });

  it("preserves meaningful leading zeroes in phone search", () => {
    const { orders } = adaptGoogleFormSheetRows(buildFormRows());

    expect(
      searchCustomerOrders(orders, {
        fullName: "",
        phoneNumber: "960969594"
      })
    ).toEqual([]);
  });

  it("handles multiple separate orders for the same customer", () => {
    const { orders } = adaptGoogleFormSheetRows(buildMultiOrderFormRows());
    const result = searchOrders(orders, {
      searchMode: "customer",
      fullName: "PRIVATE CUSTOMER",
      phoneNumber: ""
    });

    expect(result).toHaveLength(2);
    expect(result.map((order) => order.items.length)).toEqual([1, 2]);
  });

  it("finds a jersey from the old Google Form Sheet", () => {
    const { orders } = adaptGoogleFormSheetRows(buildFormRows());
    const result = searchJerseyOrders(orders, {
      printName: "BRIGHT",
      shirtNumber: "21"
    });

    expect(result).toHaveLength(1);
    expect(result[0].items).toEqual([
      expect.objectContaining({
        jerseyColor: "SONIC BLUE",
        shirtNumber: "21",
        paymentStatus: "paid"
      })
    ]);
  });

  it("finds jerseys from the new manual Sheet", () => {
    const { orders } = adaptManualOrderSheetRows(buildManualRows());
    const result = searchJerseyOrders(orders, {
      printName: "bright",
      shirtNumber: "67"
    });

    expect(result).toHaveLength(2);
    expect(result.map((order) => order.items[0].jerseyColor)).toEqual([
      "Matcha",
      "Mint chocolate chip"
    ]);
  });

  it("searches both sources and returns multiple exact matches", () => {
    const formOrders = adaptGoogleFormSheetRows(buildFormRows()).orders;
    const manualOrders = adaptManualOrderSheetRows(buildManualRows()).orders;
    const result = searchJerseyOrders([...formOrders, ...manualOrders], {
      printName: " bright ",
      shirtNumber: "67"
    });

    expect(result).toHaveLength(3);
  });

  it("searches customer mode across the combined current source models", () => {
    const formOrders = adaptGoogleFormSheetRows(buildFormRows()).orders;
    const manualOrders = adaptManualOrderSheetRows(buildManualRows()).orders;
    const result = searchOrders([...formOrders, ...manualOrders], {
      searchMode: "customer",
      fullName: "Private Customer",
      phoneNumber: ""
    });

    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(2);
  });

  it("requires printed name and jersey number", () => {
    const orders = adaptManualOrderSheetRows(buildManualRows()).orders;

    expect(searchJerseyOrders(orders, { printName: "", shirtNumber: "67" })).toEqual(
      []
    );
    expect(searchJerseyOrders(orders, { printName: "BRIGHT", shirtNumber: "" })).toEqual(
      []
    );
  });

  it("rejects oversized public search inputs", () => {
    const orders = adaptManualOrderSheetRows(buildManualRows()).orders;

    expect(
      searchCustomerOrders(orders, {
        fullName: "A".repeat(121),
        phoneNumber: ""
      })
    ).toEqual([]);
    expect(
      searchJerseyOrders(orders, {
        printName: "BRIGHT",
        shirtNumber: "7".repeat(13)
      })
    ).toEqual([]);
  });

  it("preserves meaningful jersey-number formatting", () => {
    const orders = [
      {
        id: "manual_07",
        orderCode: "MANUAL-07",
        source: "manual",
        items: [
          {
            productName: "University Jersey Shirt",
            jerseyColor: "Americano",
            jerseySize: "XL",
            printName: "ZERO",
            shirtNumber: "07",
            universityAbbreviation: "KMUTT",
            paymentStatus: "unpaid",
            quantity: 1,
            unitPrice: null,
            currency: "THB"
          }
        ]
      }
    ] satisfies OrderRecord[];

    expect(searchJerseyOrders(orders, { printName: "zero", shirtNumber: "7" })).toEqual(
      []
    );
    expect(searchJerseyOrders(orders, { printName: "zero", shirtNumber: "07" })).toHaveLength(
      1
    );
  });

  it("returns only matching jerseys, not sibling jerseys", () => {
    const { orders } = adaptGoogleFormSheetRows(buildFormRows());
    const result = searchJerseyOrders(orders, {
      printName: "BRIGHT",
      shirtNumber: "67"
    });

    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(1);
    expect(result[0].items[0]).toEqual(
      expect.objectContaining({
        jerseyColor: "IGNITE RED",
        shirtNumber: "67"
      })
    );
  });

  it("finds jerseys where the sheet has spaced numbers like 0 4 using standard input 04", () => {
    const { orders } = adaptManualOrderSheetRows([
      ["ORDER NUMBER", "COLOR", "NAME", "NUMBER", "SIZE", "UNIVERSITY", "PAYMENT STATUS"],
      ["8", "Strawberry milkshake", "Rawiin", "0 8", "M", "NORTH BANGKOK", "PAID"],
      ["16", "Strawberry milkshake", "PVCY_KT", "0 4", "2XL", "LADKRABANG", "PAID"]
    ]);

    const result04 = searchJerseyOrders(orders, {
      printName: "PVCY_KT",
      shirtNumber: "04"
    });
    expect(result04).toHaveLength(1);
    expect(result04[0].items[0].shirtNumber).toBe("04");

    const result08 = searchJerseyOrders(orders, {
      printName: "rawiin",
      shirtNumber: "08"
    });
    expect(result08).toHaveLength(1);
    expect(result08[0].items[0].shirtNumber).toBe("08");

    // Also works if customer types "0 4" with space
    const resultWithSpace = searchJerseyOrders(orders, {
      printName: "pvcy_kt",
      shirtNumber: "0 4"
    });
    expect(resultWithSpace).toHaveLength(1);
  });

  it("does not expose sensitive Sheet fields in public search results", () => {
    const { orders } = adaptGoogleFormSheetRows(buildFormRows());
    const result = searchCustomerOrders(orders, {
      fullName: "Private Customer",
      phoneNumber: ""
    });
    const serializedResult = JSON.stringify(result);

    expect(serializedResult).not.toContain("Private Customer");
    expect(serializedResult).not.toContain("0960969594");
    expect(serializedResult).not.toContain("private@example.com");
    expect(serializedResult).not.toContain("payment-slip");
    expect(serializedResult).not.toContain("private address");
  });
});
