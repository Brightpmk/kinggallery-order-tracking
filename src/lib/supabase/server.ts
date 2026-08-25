import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig, getSupabaseServiceRoleKey } from "./config";

export function createSupabaseServerClient(): SupabaseClient {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error("Missing public Supabase environment variables.");
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false
    }
  });
}

export function createSupabaseServiceRoleClient(): SupabaseClient {
  const config = getSupabasePublicConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!config || !serviceRoleKey) {
    throw new Error("Missing Supabase service-role environment variables.");
  }

  return createClient(config.url, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });
}
