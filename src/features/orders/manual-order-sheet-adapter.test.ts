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

  it("accepts arbitrary new JerseyColor values", () => {
    const { orders } = adaptManualOrderSheetRows([
      headerRow,
      ["1", "Future color", "BRIGHT", "67", "XL", "KMUTT", ""]
    ]);

    expect(orders[0].items[0].jerseyColor).toBe("Future color");
  });
});
