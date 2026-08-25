export type CustomerOrderSearchInput =
  | {
      type: "name";
      value: string;
    }
  | {
      type: "phone";
      value: string;
    };

export type NormalizedCustomerOrderSearch =
  | {
      type: "name";
      value: string;
    }
  | {
      type: "phone";
      value: string;
    };

export function normalizeFullName(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizePhoneNumber(value: string): string {
  return value.replace(/\D/g, "");
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
