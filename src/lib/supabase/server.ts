import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./config";
import type { Database } from "./database.types";
import { getSupabaseServiceRoleKey } from "./server-config";

export function createSupabaseServerClient(): SupabaseClient<Database> {
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

export function createSupabaseServiceRoleClient(): SupabaseClient<Database> {
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
