import type { SheetRow } from "@/lib/google-sheets/sheets-client";

export type OrderSheetSource = {
  name: "google_form" | "manual" | "website";
  readRows(): Promise<SheetRow[]>;
};
