import type { OrderRecord } from "./types";

export const mockOrders = [
  {
    id: "ord_001",
    orderCode: "DT-2026-1001",
    source: "google_form",
    createdAt: "2026-08-18T09:15:00.000Z",
    updatedAt: "2026-08-20T11:40:00.000Z",
    status: "shipped",
    customerName: "Maya Chen",
    phoneNumber: "+66 81 000 0101",
    items: [
      {
        productName: "Linen Everyday Shirt",
        variant: "Sage",
        size: "M",
        quantity: 1,
        unitPrice: 890,
        currency: "THB"
      },
      {
        productName: "Cotton Wide-Leg Pants",
        variant: "Black",
        size: "L",
        quantity: 1,
        unitPrice: 1290,
        currency: "THB"
      }
    ],
    shippingProvider: "Kerry Express",
    trackingNumber: "KEXMOCK1001001",
    timeline: [
      {
        status: "pending",
        occurredAt: "2026-08-18T09:15:00.000Z",
        note: "Order submitted through the public form."
      },
      {
        status: "confirmed",
        occurredAt: "2026-08-18T13:25:00.000Z",
        note: "Payment verified by staff."
      },
      {
        status: "preparing",
        occurredAt: "2026-08-19T04:30:00.000Z",
        note: "Items prepared for shipment."
      },
      {
        status: "shipped",
        occurredAt: "2026-08-20T11:40:00.000Z",
        note: "Package handed to carrier."
      }
    ],
    staffNotes: "Fictional development order. Do not use for real fulfillment."
  },
  {
    id: "ord_002",
    orderCode: "DT-2026-1002",
    source: "line",
    createdAt: "2026-08-19T14:05:00.000Z",
    updatedAt: "2026-08-21T06:20:00.000Z",
    status: "preparing",
    customerName: "Anika Patel",
    phoneNumber: "+66 82 000 0202",
    items: [
      {
        productName: "Ribbed Knit Tank",
        variant: "Ivory",
        size: "S",
        quantity: 2,
        unitPrice: 490,
        currency: "THB"
      }
    ],
    timeline: [
      {
        status: "pending",
        occurredAt: "2026-08-19T14:05:00.000Z",
        note: "Manual order entered from chat."
      },
      {
        status: "confirmed",
        occurredAt: "2026-08-20T03:10:00.000Z",
        note: "Order details confirmed."
      },
      {
        status: "preparing",
        occurredAt: "2026-08-21T06:20:00.000Z",
        note: "Order is being packed."
      }
    ],
    staffNotes: "Customer asked for gift wrapping in the original mock chat."
  },
  {
    id: "ord_003",
    orderCode: "DT-2026-1003",
    source: "manual",
    createdAt: "2026-08-22T02:35:00.000Z",
    updatedAt: "2026-08-22T02:35:00.000Z",
    status: "pending",
    customerName: "Narin Wallace",
    phoneNumber: "+66 83 000 0303",
    items: [
      {
        productName: "Relaxed Denim Jacket",
        variant: "Washed Blue",
        size: "Free Size",
        quantity: 1,
        unitPrice: 1590,
        currency: "THB"
      }
    ],
    timeline: [
      {
        status: "pending",
        occurredAt: "2026-08-22T02:35:00.000Z",
        note: "Order created by staff."
      }
    ],
    staffNotes: "Awaiting payment confirmation in this mock scenario."
  }
] satisfies OrderRecord[];
