import type { SheetRow } from "@/lib/google-sheets/sheets-client";

export type OrderSheetSource = {
  name: "google_form" | "manual";
  readRows(): Promise<SheetRow[]>;
};
