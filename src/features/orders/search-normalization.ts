export type SearchMode = "customer" | "jersey";

export type CustomerOrderSearchInput = {
  fullName: string;
  phoneNumber: string;
};

export type JerseyOrderSearchInput = {
  printName: string;
  shirtNumber: string;
};

export type OrderSearchInput =
  | ({
      searchMode: "customer";
    } & CustomerOrderSearchInput)
  | ({
      searchMode: "jersey";
    } & JerseyOrderSearchInput);

export type NormalizedCustomerOrderSearch = {
  fullName: string | null;
  phoneNumber: string | null;
};

export type NormalizedJerseyOrderSearch = {
  printName: string;
  shirtNumber: string;
};

export type NormalizedOrderSearch =
  | ({
      searchMode: "customer";
    } & NormalizedCustomerOrderSearch)
  | ({
      searchMode: "jersey";
    } & NormalizedJerseyOrderSearch);

const maxFullNameLength = 120;
const maxPhoneNumberLength = 32;
const maxPrintedNameLength = 60;
const maxJerseyNumberLength = 12;

export function normalizeFullName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizePhoneNumber(value: string): string {
  return normalizeSpreadsheetIdentifier(value).replace(/[\s-]+/g, "");
}

export function normalizePrintedName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeJerseyNumber(value: string): string {
  return normalizeSpreadsheetIdentifier(value).replace(/\s+/g, "");
}

export function normalizeCustomerOrderSearch(
  input: CustomerOrderSearchInput
): NormalizedCustomerOrderSearch | null {
  if (
    input.fullName.length > maxFullNameLength ||
    input.phoneNumber.length > maxPhoneNumberLength
  ) {
    return null;
  }

  const fullName = normalizeFullName(input.fullName);
  const phoneNumber = normalizePhoneNumber(input.phoneNumber);

  if (fullName === "" && phoneNumber === "") {
    return null;
  }

  return {
    fullName: fullName || null,
    phoneNumber: phoneNumber || null
  };
}

export function normalizeJerseyOrderSearch(
  input: JerseyOrderSearchInput
): NormalizedJerseyOrderSearch | null {
  if (
    input.printName.length > maxPrintedNameLength ||
    input.shirtNumber.length > maxJerseyNumberLength
  ) {
    return null;
  }

  const printName = normalizePrintedName(input.printName);
  const shirtNumber = normalizeJerseyNumber(input.shirtNumber);

  if (printName === "" || shirtNumber === "") {
    return null;
  }

  return { printName, shirtNumber };
}

export function normalizeOrderSearch(
  input: OrderSearchInput
): NormalizedOrderSearch | null {
  if (input.searchMode === "customer") {
    const customerSearch = normalizeCustomerOrderSearch(input);
    return customerSearch
      ? { searchMode: "customer", ...customerSearch }
      : null;
  }

  const jerseySearch = normalizeJerseyOrderSearch(input);
  return jerseySearch ? { searchMode: "jersey", ...jerseySearch } : null;
}

function normalizeSpreadsheetIdentifier(value: string): string {
  return value.replace(/^\s+|\s+$/g, "").replace(/\.0+$/, "");
}
