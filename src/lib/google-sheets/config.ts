import "server-only";

export type GoogleSheetRangeConfig = {
  spreadsheetId: string;
  range: string;
};

export type GoogleSheetsConfig = {
  formResponses: GoogleSheetRangeConfig;
  manualOrders: GoogleSheetRangeConfig;
  serviceAccountEmail: string;
  serviceAccountPrivateKey: string;
  cacheTtlMs: number;
};

const defaultFormResponsesRange = "'การตอบแบบฟอร์ม 1'!A:U";
const defaultCacheTtlMs = 60_000;

export function getGoogleSheetsConfig(): GoogleSheetsConfig | null {
  const formSpreadsheetId = readEnvValue("GOOGLE_SHEETS_SPREADSHEET_ID");
  const manualSpreadsheetId = readEnvValue(
    "GOOGLE_SHEETS_MANUAL_SPREADSHEET_ID"
  );
  const manualRange = readEnvValue("GOOGLE_SHEETS_MANUAL_RANGE");
  const serviceAccountEmail = readEnvValue("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const serviceAccountPrivateKey = readEnvValue(
    "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"
  );

  if (
    !formSpreadsheetId ||
    !manualSpreadsheetId ||
    !manualRange ||
    !serviceAccountEmail ||
    !serviceAccountPrivateKey
  ) {
    return null;
  }

  return {
    formResponses: {
      spreadsheetId: formSpreadsheetId,
      range:
        readEnvValue("GOOGLE_SHEETS_FORM_RESPONSES_RANGE") ??
        defaultFormResponsesRange
    },
    manualOrders: {
      spreadsheetId: manualSpreadsheetId,
      range: manualRange
    },
    serviceAccountEmail,
    serviceAccountPrivateKey: normalizePrivateKey(serviceAccountPrivateKey),
    cacheTtlMs: readCacheTtlMs()
  };
}

function readEnvValue(key: string): string | undefined {
  const value = process.env[key];
  const trimmedValue = value?.trim();
  return trimmedValue === "" ? undefined : trimmedValue;
}

function normalizePrivateKey(value: string): string {
  return value.replace(/\\n/g, "\n");
}

function readCacheTtlMs(): number {
  const rawValue = readEnvValue("GOOGLE_SHEETS_CACHE_TTL_SECONDS");

  if (!rawValue) {
    return defaultCacheTtlMs;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return defaultCacheTtlMs;
  }

  return parsedValue * 1000;
}
