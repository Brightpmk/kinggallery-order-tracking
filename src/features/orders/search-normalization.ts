export type CustomerOrderSearchInput =
  | {
      type: "name";
      value: string;
    }
  | {
      type: "phone";
      value: string;
    };

export type JerseyOrderSearchInput = {
  mode: "jersey";
  printName: string;
  shirtNumber: string;
};

export type TrackingSearchInput =
  | ({
      mode: "customer";
    } & CustomerOrderSearchInput)
  | JerseyOrderSearchInput;

export type NormalizedCustomerOrderSearch =
  | {
      type: "name";
      value: string;
    }
  | {
      type: "phone";
      value: string;
    };

export type NormalizedTrackingSearch =
  | ({
      mode: "customer";
    } & NormalizedCustomerOrderSearch)
  | {
      mode: "jersey";
      printName: string;
      shirtNumber: string;
    };

export function normalizeFullName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizePhoneNumber(value: string): string {
  return normalizeSpreadsheetIdentifier(value).replace(/\D/g, "");
}

export function normalizePrintedName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeJerseyNumber(value: string): string {
  return normalizeSpreadsheetIdentifier(value).trim();
}

export function normalizeCustomerOrderSearch(
  input: CustomerOrderSearchInput
): NormalizedCustomerOrderSearch | null {
  if (input.type === "name") {
    const normalizedName = normalizeFullName(input.value);
    return normalizedName === ""
      ? null
      : { type: "name", value: normalizedName };
  }

  const normalizedPhone = normalizePhoneNumber(input.value);
  return normalizedPhone === ""
    ? null
    : { type: "phone", value: normalizedPhone };
}

function normalizeSpreadsheetIdentifier(value: string): string {
  return value.replace(/^\s+|\s+$/g, "").replace(/\.0+$/, "");
}
