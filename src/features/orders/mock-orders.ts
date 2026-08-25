import type { OrderRecord } from "./types";

export const mockOrders = [
  {
    id: "ord_001",
    orderId: "DT-2026-1001",
    channel: "google_form",
    createdAt: "2026-08-18T09:15:00.000Z",
    updatedAt: "2026-08-20T11:40:00.000Z",
    status: "shipped",
    customerName: "Maya Chen",
    phoneNumber: "+66 81 000 0101",
    shippingAddress: "Fictional address, Bangkok 10110",
    paymentReference: "mock-payment-ref-1001",
    items: [
      {
        productName: "Linen Everyday Shirt",
        variantName: "Sage",
        size: "M",
        quantity: 1
      },
      {
        productName: "Cotton Wide-Leg Pants",
        variantName: "Black",
        size: "L",
        quantity: 1
      }
    ],
    carrier: "Kerry Express",
    trackingNumber: "KEXMOCK1001001",
    timeline: [
      {
        status: "received",
        occurredAt: "2026-08-18T09:15:00.000Z",
        note: "Order submitted through the public form."
      },
      {
        status: "confirmed",
        occurredAt: "2026-08-18T13:25:00.000Z",
        note: "Payment verified by staff."
      },
      {
        status: "packing",
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
    orderId: "DT-2026-1002",
    channel: "line",
    createdAt: "2026-08-19T14:05:00.000Z",
    updatedAt: "2026-08-21T06:20:00.000Z",
    status: "packing",
    customerName: "Anika Patel",
    phoneNumber: "+66 82 000 0202",
    shippingAddress: "Fictional address, Chiang Mai 50000",
    items: [
      {
        productName: "Ribbed Knit Tank",
        variantName: "Ivory",
        size: "S",
        quantity: 2
      }
    ],
    timeline: [
      {
        status: "received",
        occurredAt: "2026-08-19T14:05:00.000Z",
        note: "Manual order entered from chat."
      },
      {
        status: "confirmed",
        occurredAt: "2026-08-20T03:10:00.000Z",
        note: "Order details confirmed."
      },
      {
        status: "packing",
        occurredAt: "2026-08-21T06:20:00.000Z",
        note: "Order is being packed."
      }
    ],
    staffNotes: "Customer asked for gift wrapping in the original mock chat."
  },
  {
    id: "ord_003",
    orderId: "DT-2026-1003",
    channel: "manual",
    createdAt: "2026-08-22T02:35:00.000Z",
    updatedAt: "2026-08-22T02:35:00.000Z",
    status: "received",
    customerName: "Narin Wallace",
    phoneNumber: "+66 83 000 0303",
    shippingAddress: "Fictional address, Phuket 83000",
    items: [
      {
        productName: "Relaxed Denim Jacket",
        variantName: "Washed Blue",
        size: "Free Size",
        quantity: 1
      }
    ],
    timeline: [
      {
        status: "received",
        occurredAt: "2026-08-22T02:35:00.000Z",
        note: "Order created by staff."
      }
    ],
    staffNotes: "Awaiting payment confirmation in this mock scenario."
  }
] satisfies OrderRecord[];
