export type JerseyColor = string;

export type JerseySize = string;

export const deliveryMethods = ["pickup", "shipping"] as const;

export type DeliveryMethod = (typeof deliveryMethods)[number];

export const deliveryMethodLabels = {
  pickup: "Pickup",
  shipping: "Shipping"
} satisfies Record<DeliveryMethod, string>;

export const knownJerseyColorSwatches: Record<string, string> = {
  "CANDY PINK": "#f6aac8",
  "IGNITE RED": "#c8212b",
  "COPPER ROSE": "#b86f5e",
  "SHADOW BLACK": "#1e2329",
  "SONIC BLUE": "#226fd3",
  "AURA GREEN": "#2d9f6f"
};

export function getDeliveryMethodLabel(method: DeliveryMethod): string {
  return deliveryMethodLabels[method];
}

export function getJerseyColorSwatch(color: JerseyColor): string {
  return knownJerseyColorSwatches[color.toUpperCase()] ?? createColorSwatch(color);
}

function createColorSwatch(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 45% 54%)`;
}
