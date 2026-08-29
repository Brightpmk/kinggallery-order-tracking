import { toPublicOrderSummary } from "./public-order";
import {
  normalizeJerseyNumber,
  normalizePrintedName,
  normalizeJerseyOrderSearch,
  type JerseyOrderSearchInput,
  type NormalizedJerseyOrderSearch
} from "./search-normalization";
import type { OrderItem, OrderRecord, PublicOrderSummary } from "./types";

export function searchJerseyOrders(
  orders: OrderRecord[],
  input: JerseyOrderSearchInput
): PublicOrderSummary[] {
  const normalizedSearch = normalizeJerseyOrderSearch(input);

  if (!normalizedSearch) {
    return [];
  }

  return searchJerseyItems(orders, normalizedSearch);
}

function searchJerseyItems(
  orders: OrderRecord[],
  search: NormalizedJerseyOrderSearch
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

function isMatchingJersey(item: OrderItem, search: NormalizedJerseyOrderSearch): boolean {
  return (
    normalizePrintedName(item.printName ?? "") === search.printName &&
    normalizeJerseyNumber(item.shirtNumber ?? "") === search.shirtNumber
  );
}

function sortByNewest(first: OrderRecord, second: OrderRecord): number {
  return (second.createdAt ?? "").localeCompare(first.createdAt ?? "");
}
