import type { PublicOrderItem } from "@/features/orders/types";

type OrderItemListProps = {
  items: PublicOrderItem[];
};

export function OrderItemList({ items }: OrderItemListProps) {
  return (
    <ul className="order-items">
      {items.map((item, index) => (
        <li key={`${item.productName}-${item.variant ?? "variant"}-${index}`}>
          <div>
            <strong>{item.productName}</strong>
            <span>
              {[item.variant, item.size].filter(Boolean).join(" / ") ||
                "Standard"}
            </span>
          </div>
          <span className="quantity">x{item.quantity}</span>
        </li>
      ))}
    </ul>
  );
}
