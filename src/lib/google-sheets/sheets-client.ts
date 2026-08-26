import "server-only";

import { google } from "googleapis";
import { getGoogleSheetsConfig } from "./config";

export type SheetCellValue = string | number | boolean | null | undefined;
export type SheetRow = SheetCellValue[];

type CachedSheetRows = {
  rows: SheetRow[];
  expiresAt: number;
};

let cachedFormRows: CachedSheetRows | null = null;

export async function readGoogleFormSheetRows(): Promise<SheetRow[]> {
  const config = getGoogleSheetsConfig();

  if (!config) {
    throw new GoogleSheetsConfigError(
      "Google Sheets lookup is missing required server environment variables."
    );
  }

  const now = Date.now();

  if (cachedFormRows && cachedFormRows.expiresAt > now) {
    return cachedFormRows.rows;
  }

  const auth = new google.auth.JWT({
    email: config.serviceAccountEmail,
    key: config.serviceAccountPrivateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });

  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: config.formResponsesRange,
    valueRenderOption: "FORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING"
  });

  const rows = (response.data.values ?? []) as SheetRow[];
  cachedFormRows = {
    rows,
    expiresAt: now + config.cacheTtlMs
  };

  return rows;
}

export class GoogleSheetsConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleSheetsConfigError";
  }
}
