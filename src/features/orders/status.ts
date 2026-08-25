import type { OrderStatus } from "./types";

export const orderStatusLabels = {
  pending: "Pending confirmation",
  confirmed: "Order confirmed",
  preparing: "Preparing jersey",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled"
} satisfies Record<OrderStatus, string>;

export function getOrderStatusLabel(status: OrderStatus): string {
  return orderStatusLabels[status];
}
