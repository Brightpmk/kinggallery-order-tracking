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
    deliveryMethod: order.deliveryMethod,
    items: order.items.map((item) => ({
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

export function toPublicOrderSummaryFromDatabase(
  order: PublicOrderDatabaseRecord
): PublicOrderSummary {
  return {
    orderCode: order.order_code,
    createdAt: order.created_at,
    status: order.status,
    deliveryMethod: order.delivery_method,
    items: order.order_items.map((item) => ({
      productName: item.product_name,
      jerseyColor: item.jersey_color,
      jerseySize: item.jersey_size,
      printName: item.print_name,
      shirtNumber: item.shirt_number,
      universityAbbreviation: item.university_abbreviation,
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
