"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabasePublicConfig } from "./config";

let browserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error("Missing public Supabase environment variables.");
  }

  browserClient ??= createClient(config.url, config.anonKey);
  return browserClient;
}
