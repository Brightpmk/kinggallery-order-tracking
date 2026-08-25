import "server-only";

function readEnvValue(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value === "" ? undefined : value;
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return readEnvValue("SUPABASE_SERVICE_ROLE_KEY");
}

export type OrderLookupDataSource = "mock" | "supabase";

export function getOrderLookupDataSource(): OrderLookupDataSource {
  const value = readEnvValue("ORDER_LOOKUP_DATA_SOURCE")?.toLowerCase();

  if (!value) {
    return "mock";
  }

  if (value === "mock" || value === "supabase") {
    return value;
  }

  console.warn(
    "Invalid ORDER_LOOKUP_DATA_SOURCE value. Falling back to mock order data."
  );
  return "mock";
}
