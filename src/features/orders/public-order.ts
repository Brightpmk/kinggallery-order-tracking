import type { OrderRecord, PublicOrderSummary } from "./types";

export function toPublicOrderSummary(order: OrderRecord): PublicOrderSummary {
  return {
    orderId: order.orderId,
    status: order.status,
    items: order.items,
    carrier: order.carrier,
    trackingNumber: order.trackingNumber,
    timeline: order.timeline
  };
}
