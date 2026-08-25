import type { OrderRecord } from "./types";

export const mockOrders = [
  {
    id: "ord_001",
    orderCode: "UJ-2026-3001",
    source: "google_form",
    deliveryMethod: "pickup",
    createdAt: "2026-08-18T09:15:00.000Z",
    updatedAt: "2026-08-21T06:20:00.000Z",
    status: "preparing",
    customerName: "Alex Sample",
    phoneNumber: "+66 80 000 1001",
    items: [
      {
        productName: "University Jersey Shirt",
        variant: null,
        jerseyColor: "SHADOW BLACK",
        jerseySize: "L",
        printName: "BRIGHT",
        shirtNumber: "21",
        universityAbbreviation: "KMUTT",
        quantity: 1,
        unitPrice: 790,
        currency: "THB"
      },
      {
        productName: "University Jersey Shirt",
        variant: null,
        jerseyColor: "CANDY PINK",
        jerseySize: "M",
        printName: "POKO",
        shirtNumber: "8",
        universityAbbreviation: "LARDKRABANG",
        quantity: 1,
        unitPrice: 790,
        currency: "THB"
      }
    ],
    timeline: [
      {
        status: "pending",
        occurredAt: "2026-08-18T09:15:00.000Z",
        note: "Jersey order submitted."
      },
      {
        status: "confirmed",
        occurredAt: "2026-08-18T13:25:00.000Z",
        note: "Order details confirmed."
      },
      {
        status: "preparing",
        occurredAt: "2026-08-21T06:20:00.000Z",
        note: "Jerseys are being prepared for pickup."
      }
    ],
    staffNotes: "Fictional pickup order for development only."
  },
  {
    id: "ord_002",
    orderCode: "UJ-2026-3002",
    source: "line",
    deliveryMethod: "shipping",
    createdAt: "2026-08-16T04:10:00.000Z",
    updatedAt: "2026-08-20T11:40:00.000Z",
    status: "shipped",
    customerName: "Jamie Example",
    phoneNumber: "+66 80 000 1002",
    items: [
      {
        productName: "University Jersey Shirt",
        variant: null,
        jerseyColor: "SONIC BLUE",
        jerseySize: "XL",
        printName: "JAMIE",
        shirtNumber: "10",
        universityAbbreviation: "NORTH BANGKOK",
        quantity: 1,
        unitPrice: 790,
        currency: "THB"
      }
    ],
    shippingProvider: "Kerry Express",
    trackingNumber: "KEXFAKE3002001",
    timeline: [
      {
        status: "pending",
        occurredAt: "2026-08-16T04:10:00.000Z",
        note: "Manual jersey order entered from chat."
      },
      {
        status: "confirmed",
        occurredAt: "2026-08-16T06:20:00.000Z",
        note: "Order details confirmed."
      },
      {
        status: "preparing",
        occurredAt: "2026-08-18T03:30:00.000Z",
        note: "Jersey printing started."
      },
      {
        status: "shipped",
        occurredAt: "2026-08-20T11:40:00.000Z",
        note: "Package handed to carrier."
      }
    ],
    staffNotes: "Fictional shipped order for development only."
  },
  {
    id: "ord_003",
    orderCode: "UJ-2026-3003",
    source: "manual",
    deliveryMethod: "shipping",
    createdAt: "2026-08-22T02:35:00.000Z",
    updatedAt: "2026-08-22T08:00:00.000Z",
    status: "confirmed",
    customerName: "Taylor Demo",
    phoneNumber: "+66 80 000 1003",
    items: [
      {
        productName: "University Jersey Shirt",
        variant: null,
        jerseyColor: "IGNITE RED",
        jerseySize: "5XL",
        printName: "TAYLOR",
        shirtNumber: "99",
        universityAbbreviation: "KMUTT",
        quantity: 1,
        unitPrice: 790,
        currency: "THB"
      }
    ],
    timeline: [
      {
        status: "pending",
        occurredAt: "2026-08-22T02:35:00.000Z",
        note: "Order created by staff."
      },
      {
        status: "confirmed",
        occurredAt: "2026-08-22T08:00:00.000Z",
        note: "Jersey details confirmed."
      }
    ],
    staffNotes: "Shipping order without tracking number for development only."
  },
  {
    id: "ord_004",
    orderCode: "UJ-2026-3004",
    source: "google_form",
    deliveryMethod: "shipping",
    createdAt: "2026-08-10T05:00:00.000Z",
    updatedAt: "2026-08-14T09:45:00.000Z",
    status: "delivered",
    customerName: "Alex Sample",
    phoneNumber: "+66-80-000-1001",
    items: [
      {
        productName: "University Jersey Shirt",
        variant: null,
        jerseyColor: "COPPER ROSE",
        jerseySize: "XS",
        printName: "ALEX",
        shirtNumber: "7",
        universityAbbreviation: "NORTH BANGKOK",
        quantity: 1,
        unitPrice: 790,
        currency: "THB"
      }
    ],
    shippingProvider: "Thailand Post",
    trackingNumber: "THPFAKE3004001",
    timeline: [
      {
        status: "pending",
        occurredAt: "2026-08-10T05:00:00.000Z",
        note: "Jersey order submitted."
      },
      {
        status: "confirmed",
        occurredAt: "2026-08-10T07:20:00.000Z",
        note: "Order details confirmed."
      },
      {
        status: "preparing",
        occurredAt: "2026-08-11T03:30:00.000Z",
        note: "Jersey printing completed."
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
    orderCode: "UJ-2026-3005",
    source: "line",
    deliveryMethod: "pickup",
    createdAt: "2026-08-23T05:00:00.000Z",
    updatedAt: "2026-08-23T08:30:00.000Z",
    status: "cancelled",
    customerName: "Casey Cancelled",
    phoneNumber: "+66 80 000 1005",
    items: [
      {
        productName: "University Jersey Shirt",
        variant: null,
        jerseyColor: "AURA GREEN",
        jerseySize: "3XL",
        printName: "CASEY",
        shirtNumber: "5",
        universityAbbreviation: "LARDKRABANG",
        quantity: 1,
        unitPrice: 790,
        currency: "THB"
      }
    ],
    timeline: [
      {
        status: "pending",
        occurredAt: "2026-08-23T05:00:00.000Z",
        note: "Manual jersey order entered from chat."
      },
      {
        status: "cancelled",
        occurredAt: "2026-08-23T08:30:00.000Z",
        note: "Order cancelled before preparation."
      }
    ],
    staffNotes: "Cancellation scenario for development only."
  }
] satisfies OrderRecord[];
