import type { PublicOrderSummary } from "./types";

export type TrackingSearchMode = "customer" | "jersey";
export type CustomerSearchType = "name" | "phone";

export type TrackingSearchState = {
  status: "idle" | "invalid" | "error" | "success" | "no_results";
  message: string | null;
  orders: PublicOrderSummary[];
  searchMode: TrackingSearchMode;
  customerSearchType: CustomerSearchType;
  submissionToken: number;
};

export const initialTrackingSearchState: TrackingSearchState = {
  status: "idle",
  message: null,
  orders: [],
  searchMode: "customer",
  customerSearchType: "name",
  submissionToken: 0
};
