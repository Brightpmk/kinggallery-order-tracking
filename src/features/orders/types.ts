import type {
  OrderItemRow,
  OrderRow,
  OrderStatusHistoryRow
} from "@/lib/supabase/database.types";
import type { DeliveryMethod, JerseyColor, JerseySize } from "./jersey";

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
  jerseyColor: JerseyColor | null;
  jerseySize: JerseySize | null;
  printName: string | null;
  shirtNumber: string | null;
  universityAbbreviation: string | null;
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
  deliveryMethod: DeliveryMethod;
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
  jerseyColor: JerseyColor | null;
  jerseySize: JerseySize | null;
  printName: string | null;
  shirtNumber: string | null;
  universityAbbreviation: string | null;
  quantity: number;
};

export type PublicOrderSummary = {
  orderCode: string;
  createdAt: string;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
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
  | "order_code"
  | "created_at"
  | "status"
  | "delivery_method"
  | "tracking_number"
  | "shipping_provider"
> & {
  order_items: Pick<
    OrderItemRow,
    | "product_name"
    | "jersey_color"
    | "jersey_size"
    | "print_name"
    | "shirt_number"
    | "university_abbreviation"
    | "quantity"
  >[];
  order_status_history: Pick<
    OrderStatusHistoryRow,
    "status" | "note" | "created_at"
  >[];
};
