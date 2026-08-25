export const jerseyColors = [
  "CANDY PINK",
  "IGNITE RED",
  "COPPER ROSE",
  "SHADOW BLACK",
  "SONIC BLUE",
  "AURA GREEN"
] as const;

export type JerseyColor = (typeof jerseyColors)[number];

export const jerseySizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "5XL"
] as const;

export type JerseySize = (typeof jerseySizes)[number];

export const deliveryMethods = ["pickup", "shipping"] as const;

export type DeliveryMethod = (typeof deliveryMethods)[number];

export const deliveryMethodLabels = {
  pickup: "Pickup",
  shipping: "Shipping"
} satisfies Record<DeliveryMethod, string>;

export const jerseyColorSwatches = {
  "CANDY PINK": "#f6aac8",
  "IGNITE RED": "#c8212b",
  "COPPER ROSE": "#b86f5e",
  "SHADOW BLACK": "#1e2329",
  "SONIC BLUE": "#226fd3",
  "AURA GREEN": "#2d9f6f"
} satisfies Record<JerseyColor, string>;

export function getDeliveryMethodLabel(method: DeliveryMethod): string {
  return deliveryMethodLabels[method];
}

export function getJerseyColorSwatch(color: JerseyColor): string {
  return jerseyColorSwatches[color];
}
