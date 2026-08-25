import "server-only";

import { mockOrders } from "./mock-orders";
import {
  toPublicOrderSummary,
  toPublicOrderSummaryFromDatabase
} from "./public-order";
import {
  normalizeCustomerOrderSearch,
  type CustomerOrderSearchInput,
  type NormalizedCustomerOrderSearch
} from "./search-normalization";
import type {
  OrderItemRow,
  OrderRow,
  OrderStatusHistoryRow
} from "@/lib/supabase/database.types";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import {
  getOrderLookupDataSource,
  getSupabaseServiceRoleKey
} from "@/lib/supabase/server-config";
import type { PublicOrderDatabaseRecord, PublicOrderSummary } from "./types";

export type CustomerOrderLookupResult =
  | {
      ok: true;
      orders: PublicOrderSummary[];
      source: "database" | "mock";
    }
  | {
      ok: false;
      error: "invalid_input" | "lookup_failed";
    };

type MatchedOrderRow = Pick<
  OrderRow,
  | "id"
  | "order_code"
  | "created_at"
  | "status"
  | "delivery_method"
  | "tracking_number"
  | "shipping_provider"
  | "customer_name_normalized"
  | "customer_phone_digits"
>;

type MatchedOrderItemRow = Pick<
  OrderItemRow,
  | "order_id"
  | "product_name"
  | "jersey_color"
  | "jersey_size"
  | "print_name"
  | "shirt_number"
  | "university_abbreviation"
  | "quantity"
>;

type MatchedHistoryRow = Pick<
  OrderStatusHistoryRow,
  "order_id" | "status" | "note" | "created_at"
>;

export async function findCustomerOrders(
  input: CustomerOrderSearchInput
): Promise<CustomerOrderLookupResult> {
  const normalizedSearch = normalizeCustomerOrderSearch(input);

  if (!normalizedSearch) {
    return { ok: false, error: "invalid_input" };
  }

  if (getOrderLookupDataSource() === "mock") {
    return {
      ok: true,
      orders: findMockOrders(normalizedSearch),
      source: "mock"
    };
  }

  if (!hasServerSupabaseCredentials()) {
    console.error(
      "Order lookup is configured for Supabase, but required Supabase environment variables are missing."
    );
    return { ok: false, error: "lookup_failed" };
  }

  try {
    const orders = await findDatabaseOrders(normalizedSearch);
    return { ok: true, orders, source: "database" };
  } catch (error) {
    logOrderLookupError(error);
    return { ok: false, error: "lookup_failed" };
  }
}

function hasServerSupabaseCredentials(): boolean {
  return (
    getSupabasePublicConfig() !== null &&
    getSupabaseServiceRoleKey() !== undefined
  );
}

function logOrderLookupError(error: unknown): void {
  if (isSupabaseLikeError(error)) {
    console.error("Supabase order lookup failed.", {
      code: error.code,
      message: error.message
    });
    return;
  }

  console.error("Order lookup failed.", {
    message: error instanceof Error ? error.message : "Unknown error"
  });
}

function isSupabaseLikeError(
  error: unknown
): error is { code?: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  );
}

function findMockOrders(
  search: NormalizedCustomerOrderSearch
): PublicOrderSummary[] {
  return mockOrders
    .filter((order) => {
      if (search.type === "name") {
        return (
          normalizeCustomerOrderSearch({
            type: "name",
            value: order.customerName
          })?.value === search.value
        );
      }

      return (
        normalizeCustomerOrderSearch({
          type: "phone",
          value: order.phoneNumber
        })?.value === search.value
      );
    })
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .map(toPublicOrderSummary);
}

async function findDatabaseOrders(
  search: NormalizedCustomerOrderSearch
): Promise<PublicOrderSummary[]> {
  const supabase = createSupabaseServiceRoleClient();
  const column =
    search.type === "name" ? "customer_name_normalized" : "customer_phone_digits";

  const { data: orderRows, error: ordersError } = await supabase
    .from("orders")
    .select(
      "id, order_code, created_at, status, delivery_method, tracking_number, shipping_provider, customer_name_normalized, customer_phone_digits"
    )
    .eq(column, search.value)
    .order("created_at", { ascending: false })
    .limit(20);

  if (ordersError) {
    throw ordersError;
  }

  const matchedOrders: MatchedOrderRow[] = orderRows ?? [];
  const orderIds = matchedOrders.map((order) => order.id);

  if (orderIds.length === 0) {
    return [];
  }

  const [{ data: itemRows, error: itemsError }, { data: historyRows, error: historyError }] =
    await Promise.all([
      supabase
        .from("order_items")
        .select(
          "order_id, product_name, jersey_color, jersey_size, print_name, shirt_number, university_abbreviation, quantity"
        )
        .in("order_id", orderIds),
      supabase
        .from("order_status_history")
        .select("order_id, status, note, created_at")
        .in("order_id", orderIds)
        .order("created_at", { ascending: true })
    ]);

  if (itemsError || historyError) {
    throw itemsError ?? historyError;
  }

  return buildPublicDatabaseOrders(
    matchedOrders,
    itemRows ?? [],
    historyRows ?? []
  );
}

function buildPublicDatabaseOrders(
  orders: MatchedOrderRow[],
  items: MatchedOrderItemRow[],
  history: MatchedHistoryRow[]
): PublicOrderSummary[] {
  return orders.map((order) => {
    const publicOrder: PublicOrderDatabaseRecord = {
      order_code: order.order_code,
      created_at: order.created_at,
      status: order.status,
      delivery_method: order.delivery_method,
      tracking_number: order.tracking_number,
      shipping_provider: order.shipping_provider,
      order_items: items.filter((item) => item.order_id === order.id),
      order_status_history: history.filter((event) => event.order_id === order.id)
    };

    return toPublicOrderSummaryFromDatabase(publicOrder);
  });
}
