export type OrderStatus =
  | "received"
  | "confirmed"
  | "packing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderChannel = "google_form" | "line" | "manual";

export type OrderItem = {
  productName: string;
  variantName: string;
  size: "XS" | "S" | "M" | "L" | "XL" | "Free Size";
  quantity: number;
};

export type OrderTimelineEvent = {
  status: OrderStatus;
  occurredAt: string;
  note: string;
};

export type CustomerPrivateFields = {
  customerName: string;
  phoneNumber: string;
  shippingAddress: string;
  paymentReference?: string;
};

export type OrderRecord = CustomerPrivateFields & {
  id: string;
  orderId: string;
  channel: OrderChannel;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  items: OrderItem[];
  trackingNumber?: string;
  carrier?: string;
  timeline: OrderTimelineEvent[];
  staffNotes?: string;
};

export type PublicOrderSummary = {
  orderId: string;
  status: OrderStatus;
  items: OrderItem[];
  trackingNumber?: string;
  carrier?: string;
  timeline: OrderTimelineEvent[];
};
