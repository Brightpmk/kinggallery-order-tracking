import "server-only";

import { google } from "googleapis";
import { getGoogleSheetsConfig, type GoogleSheetRangeConfig } from "./config";

export type SheetCellValue = string | number | boolean | null | undefined;
export type SheetRow = SheetCellValue[];

type CachedSheetRows = {
  rows: SheetRow[];
  expiresAt: number;
};

let cachedFormRows: CachedSheetRows | null = null;
let cachedManualRows: CachedSheetRows | null = null;

export async function readGoogleFormSheetRows(): Promise<SheetRow[]> {
  return readConfiguredSheetRows("form", (config) => config.formResponses);
}

export async function readManualOrderSheetRows(): Promise<SheetRow[]> {
  return readConfiguredSheetRows("manual", (config) => config.manualOrders);
}

async function readConfiguredSheetRows(
  sourceName: "form" | "manual",
  selectSheet: (
    config: NonNullable<ReturnType<typeof getGoogleSheetsConfig>>
  ) => GoogleSheetRangeConfig
): Promise<SheetRow[]> {
  const config = getGoogleSheetsConfig();

  if (!config) {
    throw new GoogleSheetsConfigError(
      "Google Sheets lookup is missing required server environment variables."
    );
  }

  const now = Date.now();
  const cachedRows = getCachedRows(sourceName);

  if (cachedRows && cachedRows.expiresAt > now) {
    return cachedRows.rows;
  }

  const sheetConfig = selectSheet(config);
  const auth = new google.auth.JWT({
    email: config.serviceAccountEmail,
    key: config.serviceAccountPrivateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  });

  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetConfig.spreadsheetId,
    range: sheetConfig.range,
    valueRenderOption: "FORMATTED_VALUE",
    dateTimeRenderOption: "FORMATTED_STRING"
  });

  const rows = (response.data.values ?? []) as SheetRow[];
  const nextCachedRows = {
    rows,
    expiresAt: now + config.cacheTtlMs
  };

  setCachedRows(sourceName, nextCachedRows);

  return rows;
}

function getCachedRows(
  sourceName: "form" | "manual"
): CachedSheetRows | null {
  if (sourceName === "form") {
    return cachedFormRows;
  }

  return cachedManualRows;
}

function setCachedRows(
  sourceName: "form" | "manual",
  rows: CachedSheetRows
): void {
  if (sourceName === "form") {
    cachedFormRows = rows;
    return;
  }

  cachedManualRows = rows;
}

export class GoogleSheetsConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleSheetsConfigError";
  }
}
