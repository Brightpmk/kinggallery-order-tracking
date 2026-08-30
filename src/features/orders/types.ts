import type { DeliveryMethod, JerseyColor, JerseySize } from "./jersey";

export type OrderSource = "google_form" | "line" | "manual" | "website";

export type PaymentStatus = "paid" | "pending" | "unpaid";

export type OrderStatus =
  | "new"
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "unknown";

export type OrderItem = {
  productName: string;
  jerseyColor: JerseyColor | null;
  jerseySize: JerseySize | null;
  printName: string | null;
  shirtNumber: string | null;
  universityAbbreviation: string | null;
  paymentStatus: PaymentStatus;
  quantity: number;
  unitPrice: number | null;
  currency: string;
};

export type OrderCustomerPrivateFields = {
  fullName: string | null;
  phoneNumber: string | null;
};

export type OrderRecord = {
  id: string;
  orderCode: string;
  source: OrderSource;
  customer?: OrderCustomerPrivateFields;
  orderStatus?: OrderStatus;
  deliveryMethod?: DeliveryMethod;
  createdAt?: string;
  updatedAt?: string;
  items: OrderItem[];
  trackingNumber?: string;
  shippingProvider?: string;
  staffNotes?: string;
};

export type PublicOrderItem = {
  productName: string;
  jerseyColor: JerseyColor | null;
  jerseySize: JerseySize | null;
  printName: string | null;
  shirtNumber: string | null;
  universityAbbreviation: string | null;
  paymentStatus: PaymentStatus;
  quantity: number;
};

export type PublicOrderSummary = {
  orderCode: string;
  createdAt?: string;
  orderStatus?: OrderStatus;
  deliveryMethod?: DeliveryMethod;
  items: PublicOrderItem[];
  trackingNumber?: string;
  shippingProvider?: string;
};
