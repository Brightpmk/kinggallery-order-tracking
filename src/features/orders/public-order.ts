import type {
  OrderRecord,
  PublicOrderDatabaseRecord,
  PublicOrderSummary
} from "./types";

export function toPublicOrderSummary(order: OrderRecord): PublicOrderSummary {
  return {
    orderCode: order.orderCode,
    createdAt: order.createdAt,
    status: order.status,
    items: order.items.map((item) => ({
      productName: item.productName,
      variant: item.variant,
      size: item.size,
      quantity: item.quantity
    })),
    shippingProvider: order.shippingProvider,
    trackingNumber: order.trackingNumber,
    timeline: order.timeline
  };
}

export function toPublicOrderSummaryFromDatabase(
  order: PublicOrderDatabaseRecord
): PublicOrderSummary {
  return {
    orderCode: order.order_code,
    createdAt: order.created_at,
    status: order.status,
    items: order.order_items.map((item) => ({
      productName: item.product_name,
      variant: item.variant,
      size: item.size,
      quantity: item.quantity
    })),
    shippingProvider: order.shipping_provider ?? undefined,
    trackingNumber: order.tracking_number ?? undefined,
    timeline: order.order_status_history.map((event) => ({
      status: event.status,
      occurredAt: event.created_at,
      note: event.note ?? ""
    }))
  };
}
