import type {
  OrderItemRow,
  OrderRow,
  OrderStatusHistoryRow
} from "@/lib/supabase/database.types";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderSource = "google_form" | "line" | "manual";

export type OrderItem = {
  productName: string;
  variant: string | null;
  size: string | null;
  quantity: number;
  unitPrice: number | null;
  currency: string;
};

export type OrderTimelineEvent = {
  status: OrderStatus;
  occurredAt: string;
  note: string;
};

export type CustomerPrivateFields = {
  customerName: string;
  phoneNumber: string;
};

export type OrderRecord = CustomerPrivateFields & {
  id: string;
  orderCode: string;
  source: OrderSource;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  items: OrderItem[];
  trackingNumber?: string;
  shippingProvider?: string;
  timeline: OrderTimelineEvent[];
  staffNotes?: string;
};

export type PublicOrderItem = {
  productName: string;
  variant: string | null;
  size: string | null;
  quantity: number;
};

export type PublicOrderSummary = {
  orderCode: string;
  createdAt: string;
  status: OrderStatus;
  items: PublicOrderItem[];
  trackingNumber?: string;
  shippingProvider?: string;
  timeline: OrderTimelineEvent[];
};

export type OrderDatabaseRecord = OrderRow & {
  order_items: OrderItemRow[];
  order_status_history: OrderStatusHistoryRow[];
};

export type PublicOrderDatabaseRecord = Pick<
  OrderRow,
  "order_code" | "created_at" | "status" | "tracking_number" | "shipping_provider"
> & {
  order_items: Pick<
    OrderItemRow,
    "product_name" | "variant" | "size" | "quantity"
  >[];
  order_status_history: Pick<
    OrderStatusHistoryRow,
    "status" | "note" | "created_at"
  >[];
};
