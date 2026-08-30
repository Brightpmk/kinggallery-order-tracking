import type { OrderStatus } from "./types";

const orderStatusLabels = {
  new: "Order received",
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  unknown: "Status not available yet"
} satisfies Record<OrderStatus, string>;

export function getOrderStatusLabel(status: OrderStatus): string {
  return orderStatusLabels[status];
}
