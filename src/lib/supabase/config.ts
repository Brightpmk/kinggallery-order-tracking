export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

function readEnvValue(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value === "" ? undefined : value;
}

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = readEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return readEnvValue("SUPABASE_SERVICE_ROLE_KEY");
}
