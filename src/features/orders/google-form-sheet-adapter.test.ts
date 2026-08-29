import { describe, expect, it } from "vitest";
import {
  adaptGoogleFormSheetRows,
  googleFormHeaders,
  parseMultiJerseyField
} from "./google-form-sheet-adapter";
import { searchJerseyOrders } from "./order-search";

const headerRow = [
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

function buildRows(multiJersey = "") {
  return [
    headerRow,
    [
      "2026-07-23 10:15:48.530000",
      "  Bright   Example  ",
      "096-096-9594",
      "private@example.com",
      "line-private",
      "IGNITE RED",
      "XL",
      "bright",
      "07",
      "KMUTT",
      "https://drive.google.com/payment-slip",
      "2026-07-23",
      "10:14:00",
      "private@example.com",
      "ค่าส่งตัวละ40บาท(ตัวต่อไป+5บาท)",
      "full private shipping address",
      multiJersey
    ]
  ];
}

describe("Google Form Sheet adapter", () => {
  it("normalizes a single structured jersey", () => {
    const { orders } = adaptGoogleFormSheetRows(buildRows());

    expect(orders).toHaveLength(1);
    expect(orders[0].items).toEqual([
      expect.objectContaining({
        jerseyColor: "IGNITE RED",
        jerseySize: "XL",
        printName: "BRIGHT",
        shirtNumber: "07",
        universityAbbreviation: "KMUTT",
        paymentStatus: "paid"
      })
    ]);
  });

  it("parses Google Sheets API day-first formatted timestamps", () => {
    const rows = buildRows();
    rows[1][0] = "20/7/2026, 19:09:08";

    const { orders, diagnostics } = adaptGoogleFormSheetRows(rows);

    expect(diagnostics.skippedRows).toBe(0);
    expect(orders).toHaveLength(1);
    expect(orders[0].createdAt).toBe("2026-07-20T12:09:08.000Z");
  });

  it("does not duplicate the first jersey when repeated in the multi-jersey field", () => {
    const { orders } = adaptGoogleFormSheetRows(
      buildRows(
        "1. IGNITE RED / XL / bright / 07 / KMUTT\n2. Sonic blue/XL/bright/67/KMUTT"
      )
    );

    expect(orders[0].items).toHaveLength(2);
    expect(orders[0].items.map((item) => item.jerseyColor)).toEqual([
      "IGNITE RED",
      "SONIC BLUE"
    ]);
  });

  it("keeps the structured first jersey when multi-jersey text starts with another jersey", () => {
    const { orders } = adaptGoogleFormSheetRows(
      buildRows("1. Sonic blue/XL/bright/67/KMUTT")
    );

    expect(orders[0].items).toHaveLength(2);
    expect(orders[0].items.map((item) => item.jerseyColor)).toEqual([
      "IGNITE RED",
      "SONIC BLUE"
    ]);
  });

  it("normalizes capitalization and whitespace in multi-jersey input", () => {
    const parsed = parseMultiJerseyField(
      "  shadow black /  M /  aey   space /  01 /  kmutt  "
    );

    expect(parsed.items).toEqual([
      expect.objectContaining({
        jerseyColor: "SHADOW BLACK",
        jerseySize: "M",
        printName: "AEY SPACE",
        shirtNumber: "01",
        universityAbbreviation: "KMUTT"
      })
    ]);
  });

  it("strips spreadsheet-style trailing decimals from identifier fields", () => {
    const { orders } = adaptGoogleFormSheetRows(
      buildRows("1. SONIC BLUE / 2XL+20฿ / BALL / 67.0 / KMUTT")
    );

    expect(orders[0].items[0].shirtNumber).toBe("07");
    expect(orders[0].items[1]).toEqual(
      expect.objectContaining({
        jerseySize: "2XL",
        shirtNumber: "67"
      })
    );
  });

  it("does not expose sensitive Google Sheet fields in public search results", () => {
    const { orders } = adaptGoogleFormSheetRows(
      buildRows("1. SONIC BLUE/XL/BRIGHT/67/KMUTT")
    );
    const result = searchJerseyOrders(orders, {
      printName: "BRIGHT",
      shirtNumber: "67"
    });

    expect(JSON.stringify(result)).not.toContain("private@example.com");
    expect(JSON.stringify(result)).not.toContain("payment-slip");
    expect(JSON.stringify(result)).not.toContain("full private shipping address");
    expect(JSON.stringify(result)).not.toContain("0960969594");
  });

  it("does not expose public order status fields for old Google Form rows", () => {
    const { orders } = adaptGoogleFormSheetRows(buildRows());
    const result = searchJerseyOrders(orders, {
      printName: "BRIGHT",
      shirtNumber: "07"
    });

    expect(result).toHaveLength(1);
    expect(Object.hasOwn(result[0], "status")).toBe(false);
    expect(Object.hasOwn(result[0], "timeline")).toBe(false);
  });
});
