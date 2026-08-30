import { describe, expect, it } from "vitest";
import { adaptManualOrderSheetRows } from "./manual-order-sheet-adapter";

const headerRow = [
  "ORDER NUMBER",
  "COLOR",
  "NAME",
  "NUMBER",
  "SIZE",
  "UNIVERSITY",
  "PAYMENT STATUS"
];

describe("Manual order Sheet adapter", () => {
  it("maps PAID payment status to paid", () => {
    const { orders } = adaptManualOrderSheetRows([
      headerRow,
      ["1", "Matcha", "BRIGHT", "67", "XL", "KMUTT", "PAID"]
    ]);

    expect(orders[0].items[0]).toEqual(
      expect.objectContaining({
        jerseyColor: "Matcha",
        printName: "BRIGHT",
        shirtNumber: "67",
        paymentStatus: "paid"
      })
    );
  });

  it("maps case variants of PAID to paid", () => {
    const { orders } = adaptManualOrderSheetRows([
      headerRow,
      ["1", "Americano", "BRIGHT", "67", "XL", "KMUTT", "paid"]
    ]);

    expect(orders[0].items[0].paymentStatus).toBe("paid");
  });

  it("maps blank payment status to unpaid", () => {
    const { orders } = adaptManualOrderSheetRows([
      headerRow,
      ["1", "Strawberry milkshake", "BRIGHT", "67", "XL", "KMUTT", ""]
    ]);

    expect(orders[0].items[0].paymentStatus).toBe("unpaid");
  });

  it("handles unexpected payment status safely as unpaid", () => {
    const { orders, diagnostics } = adaptManualOrderSheetRows([
      headerRow,
      ["1", "Mint chocolate chip", "BRIGHT", "67", "XL", "KMUTT", "pending"]
    ]);

    expect(orders[0].items[0].paymentStatus).toBe("unpaid");
    expect(diagnostics.unexpectedPaymentStatusValues).toBe(1);
  });

  it("normalizes spaced jersey numbers like 0 4 to 04", () => {
    const { orders } = adaptManualOrderSheetRows([
      headerRow,
      ["8", "Strawberry milkshake", "Rawiin", "0 8", "M", "NORTH BANGKOK", "PAID"],
      ["16", "Strawberry milkshake", "PVCY_KT", "0 4", "2XL", "LADKRABANG", "PAID"]
    ]);

    expect(orders[0].items[0].shirtNumber).toBe("08");
    expect(orders[1].items[0].shirtNumber).toBe("04");
  });
});
