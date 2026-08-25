import type { OrderRecord } from "./types";

export const mockOrders = [
  {
    id: "ord_001",
    orderCode: "DT-2026-2001",
    source: "google_form",
    createdAt: "2026-08-18T09:15:00.000Z",
    updatedAt: "2026-08-20T11:40:00.000Z",
    status: "shipped",
    customerName: "Alex Sample",
    phoneNumber: "+66 80 000 1001",
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
    trackingNumber: "KEXFAKE2001001",
    timeline: [
      {
        status: "pending",
        occurredAt: "2026-08-18T09:15:00.000Z",
        note: "Order submitted through the public form."
      },
      {
        status: "confirmed",
        occurredAt: "2026-08-18T13:25:00.000Z",
        note: "Order details confirmed."
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
    orderCode: "DT-2026-2002",
    source: "line",
    createdAt: "2026-08-19T14:05:00.000Z",
    updatedAt: "2026-08-21T06:20:00.000Z",
    status: "preparing",
    customerName: "Jamie Example",
    phoneNumber: "+66 80 000 1002",
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
    orderCode: "DT-2026-2003",
    source: "manual",
    createdAt: "2026-08-22T02:35:00.000Z",
    updatedAt: "2026-08-22T02:35:00.000Z",
    status: "pending",
    customerName: "Taylor Demo",
    phoneNumber: "+66 80 000 1003",
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
    staffNotes: "Awaiting confirmation in this mock scenario."
  },
  {
    id: "ord_004",
    orderCode: "DT-2026-2004",
    source: "manual",
    createdAt: "2026-08-10T04:10:00.000Z",
    updatedAt: "2026-08-14T09:45:00.000Z",
    status: "delivered",
    customerName: "Alex Sample",
    phoneNumber: "+66-80-000-1001",
    items: [
      {
        productName: "Boxy Pocket Tee",
        variant: "Cream",
        size: "M",
        quantity: 1,
        unitPrice: 390,
        currency: "THB"
      }
    ],
    shippingProvider: "Thailand Post",
    trackingNumber: "THPFAKE2004001",
    timeline: [
      {
        status: "pending",
        occurredAt: "2026-08-10T04:10:00.000Z",
        note: "Order created by staff."
      },
      {
        status: "confirmed",
        occurredAt: "2026-08-10T06:20:00.000Z",
        note: "Order details confirmed."
      },
      {
        status: "preparing",
        occurredAt: "2026-08-11T03:30:00.000Z",
        note: "Items prepared for shipment."
      },
      {
        status: "shipped",
        occurredAt: "2026-08-12T07:15:00.000Z",
        note: "Package handed to carrier."
      },
      {
        status: "delivered",
        occurredAt: "2026-08-14T09:45:00.000Z",
        note: "Package marked as delivered."
      }
    ],
    staffNotes: "Second fictional order for multiple-result testing."
  },
  {
    id: "ord_005",
    orderCode: "DT-2026-2005",
    source: "line",
    createdAt: "2026-08-23T05:00:00.000Z",
    updatedAt: "2026-08-23T08:30:00.000Z",
    status: "cancelled",
    customerName: "Casey Cancelled",
    phoneNumber: "+66 80 000 1005",
    items: [
      {
        productName: "Pleated Midi Skirt",
        variant: "Charcoal",
        size: "S",
        quantity: 1,
        unitPrice: 990,
        currency: "THB"
      }
    ],
    timeline: [
      {
        status: "pending",
        occurredAt: "2026-08-23T05:00:00.000Z",
        note: "Manual order entered from chat."
      },
      {
        status: "cancelled",
        occurredAt: "2026-08-23T08:30:00.000Z",
        note: "Order cancelled before shipment."
      }
    ],
    staffNotes: "Cancellation scenario for development only."
  }
] satisfies OrderRecord[];
