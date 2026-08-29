import { toPublicOrderSummary } from "./public-order";
import {
  normalizeFullName,
  normalizeJerseyOrderSearch,
  normalizeJerseyNumber,
  normalizeOrderSearch,
  normalizePhoneNumber,
  normalizePrintedName,
  type CustomerOrderSearchInput,
  type JerseyOrderSearchInput,
  type NormalizedCustomerOrderSearch,
  type NormalizedJerseyOrderSearch,
  type OrderSearchInput
} from "./search-normalization";
import type { OrderItem, OrderRecord, PublicOrderSummary } from "./types";

export function searchOrders(
  orders: OrderRecord[],
  input: OrderSearchInput
): PublicOrderSummary[] {
  const normalizedSearch = normalizeOrderSearch(input);

  if (!normalizedSearch) {
    return [];
  }

  if (normalizedSearch.searchMode === "customer") {
    return searchCustomerOrderRecords(orders, normalizedSearch);
  }

  return searchJerseyItems(orders, normalizedSearch);
}

export function searchCustomerOrders(
  orders: OrderRecord[],
  input: CustomerOrderSearchInput
): PublicOrderSummary[] {
  return searchOrders(orders, {
    searchMode: "customer",
    ...input
  });
}

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

function searchCustomerOrderRecords(
  orders: OrderRecord[],
  search: NormalizedCustomerOrderSearch
): PublicOrderSummary[] {
  return orders
    .filter((order) => isMatchingCustomer(order, search))
    .sort(sortByNewest)
    .map((order) => toPublicOrderSummary(order));
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

function isMatchingCustomer(
  order: OrderRecord,
  search: NormalizedCustomerOrderSearch
): boolean {
  const customer = order.customer;

  if (!customer) {
    return false;
  }

  return (
    (search.fullName !== null &&
      normalizeFullName(customer.fullName ?? "") === search.fullName) ||
    (search.phoneNumber !== null &&
      normalizePhoneNumber(customer.phoneNumber ?? "") === search.phoneNumber)
  );
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
