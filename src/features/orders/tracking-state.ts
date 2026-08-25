import type { PublicOrderSummary } from "./types";

export type TrackingSearchState = {
  status: "idle" | "invalid" | "error" | "success" | "no_results";
  message: string | null;
  orders: PublicOrderSummary[];
};

export const initialTrackingSearchState: TrackingSearchState = {
  status: "idle",
  message: null,
  orders: []
};
