import type { OrderItem, OrderRecord, PublicOrderSummary } from "./types";

export function toPublicOrderSummary(
  order: OrderRecord,
  items: OrderItem[] = order.items
): PublicOrderSummary {
  return {
    orderCode: order.orderCode,
    createdAt: order.createdAt,
    status: order.status,
    deliveryMethod: order.deliveryMethod,
    items: items.map((item) => ({
      productName: item.productName,
      jerseyColor: item.jerseyColor,
      jerseySize: item.jerseySize,
      printName: item.printName,
      shirtNumber: item.shirtNumber,
      universityAbbreviation: item.universityAbbreviation,
      quantity: item.quantity
    })),
    shippingProvider: order.shippingProvider,
    trackingNumber: order.trackingNumber,
    timeline: order.timeline
  };
}
