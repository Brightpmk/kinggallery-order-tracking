import type { SheetRow } from "@/lib/google-sheets/sheets-client";

export type OrderSheetSource = {
  readRows(): Promise<SheetRow[]>;
};
