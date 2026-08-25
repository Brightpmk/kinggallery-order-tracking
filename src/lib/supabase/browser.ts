"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "./config";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error("Missing public Supabase environment variables.");
  }

  browserClient ??= createClient(config.url, config.anonKey);
  return browserClient;
}
