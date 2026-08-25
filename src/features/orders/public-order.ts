import type { OrderRecord, PublicOrderSummary } from "./types";

export function toPublicOrderSummary(order: OrderRecord): PublicOrderSummary {
  return {
    orderCode: order.orderCode,
    status: order.status,
    items: order.items,
    shippingProvider: order.shippingProvider,
    trackingNumber: order.trackingNumber,
    timeline: order.timeline
  };
}
