export type JerseyOrderSearchInput = {
  printName: string;
  shirtNumber: string;
};

export type NormalizedJerseyOrderSearch = {
  printName: string;
  shirtNumber: string;
};

export function normalizePrintedName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizeJerseyNumber(value: string): string {
  return normalizeSpreadsheetIdentifier(value).trim();
}

export function normalizeJerseyOrderSearch(
  input: JerseyOrderSearchInput
): NormalizedJerseyOrderSearch | null {
  const printName = normalizePrintedName(input.printName);
  const shirtNumber = normalizeJerseyNumber(input.shirtNumber);

  if (printName === "" || shirtNumber === "") {
    return null;
  }

  return { printName, shirtNumber };
}

function normalizeSpreadsheetIdentifier(value: string): string {
  return value.replace(/^\s+|\s+$/g, "").replace(/\.0+$/, "");
}
