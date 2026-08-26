import { toPublicOrderSummary } from "./public-order";
import {
  normalizeFullName,
  normalizeJerseyNumber,
  normalizePhoneNumber,
  normalizePrintedName,
  type NormalizedTrackingSearch,
  type TrackingSearchInput
} from "./search-normalization";
import type { OrderItem, OrderRecord, PublicOrderSummary } from "./types";

export function searchOrders(
  orders: OrderRecord[],
  input: TrackingSearchInput
): PublicOrderSummary[] {
  const normalizedSearch = normalizeTrackingSearch(input);

  if (!normalizedSearch) {
    return [];
  }

  if (normalizedSearch.mode === "customer") {
    return searchCustomerOrders(orders, normalizedSearch);
  }

  return searchJerseyItems(orders, normalizedSearch);
}

function searchCustomerOrders(
  orders: OrderRecord[],
  search: Extract<NormalizedTrackingSearch, { mode: "customer" }>
): PublicOrderSummary[] {
  return orders
    .filter((order) => {
      if (search.type === "name") {
        return normalizeFullName(order.customerName) === search.value;
      }

      return normalizePhoneNumber(order.phoneNumber) === search.value;
    })
    .sort(sortByNewest)
    .map((order) => toPublicOrderSummary(order));
}

function searchJerseyItems(
  orders: OrderRecord[],
  search: Extract<NormalizedTrackingSearch, { mode: "jersey" }>
): PublicOrderSummary[] {
  return orders
    .map((order) => ({
      order,
      matchingItems: order.items.filter((item) => isMatchingJersey(item, search))
    }))
    .filter(({ matchingItems }) => matchingItems.length > 0)
    .sort((first, second) => sortByNewest(first.order, second.order))
    .map(({ order, matchingItems }) => toPublicOrderSummary(order, matchingItems));
}

function normalizeTrackingSearch(
  input: TrackingSearchInput
): NormalizedTrackingSearch | null {
  if (input.mode === "customer") {
    if (input.type === "name") {
      const value = normalizeFullName(input.value);
      return value === ""
        ? null
        : {
            mode: "customer",
            type: "name",
            value
          };
    }

    const value = normalizePhoneNumber(input.value);
    return value === ""
      ? null
      : {
          mode: "customer",
          type: "phone",
          value
        };
  }

  const printName = normalizePrintedName(input.printName);
  const shirtNumber = normalizeJerseyNumber(input.shirtNumber);

  if (printName === "" || shirtNumber === "") {
    return null;
  }

  return {
    mode: "jersey",
    printName,
    shirtNumber
  };
}

function isMatchingJersey(
  item: OrderItem,
  search: Extract<NormalizedTrackingSearch, { mode: "jersey" }>
): boolean {
  return (
    normalizePrintedName(item.printName ?? "") === search.printName &&
    normalizeJerseyNumber(item.shirtNumber ?? "") === search.shirtNumber
  );
}

function sortByNewest(first: OrderRecord, second: OrderRecord): number {
  return second.createdAt.localeCompare(first.createdAt);
}
