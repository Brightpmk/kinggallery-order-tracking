import "server-only";

function readEnvValue(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value === "" ? undefined : value;
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return readEnvValue("SUPABASE_SERVICE_ROLE_KEY");
}
