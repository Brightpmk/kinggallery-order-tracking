import { describe, expect, it } from "vitest";
import { adaptGoogleFormSheetRows, googleFormHeaders } from "./google-form-sheet-adapter";
import { adaptManualOrderSheetRows } from "./manual-order-sheet-adapter";
import { searchJerseyOrders } from "./order-search";
import type { OrderRecord } from "./types";

const formHeaderRow = [
  googleFormHeaders.timestamp,
  "ชื่อ-นามสกุล(Full Name)",
  "เบอร์โทร(Phone number)",
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

function buildManualRows() {
  return [
    ["ORDER NUMBER", "COLOR", "NAME", "NUMBER", "SIZE", "UNIVERSITY", "PAYMENT STATUS"],
    ["42", "Matcha", " bright ", "67", "XL", "KMUTT", "PAID"],
    ["43", "Mint chocolate chip", "BRIGHT", "67", "L", "KMUTT", ""]
  ];
}

describe("jersey order search", () => {
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

  it("requires printed name and jersey number", () => {
    const orders = adaptManualOrderSheetRows(buildManualRows()).orders;

    expect(searchJerseyOrders(orders, { printName: "", shirtNumber: "67" })).toEqual(
      []
    );
    expect(searchJerseyOrders(orders, { printName: "BRIGHT", shirtNumber: "" })).toEqual(
      []
    );
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

  it("does not expose sensitive Sheet fields in public search results", () => {
    const { orders } = adaptGoogleFormSheetRows(buildFormRows());
    const result = searchJerseyOrders(orders, {
      printName: "BRIGHT",
      shirtNumber: "67"
    });
    const serializedResult = JSON.stringify(result);

    expect(serializedResult).not.toContain("Private Customer");
    expect(serializedResult).not.toContain("0960969594");
    expect(serializedResult).not.toContain("private@example.com");
    expect(serializedResult).not.toContain("payment-slip");
    expect(serializedResult).not.toContain("private address");
  });
});
