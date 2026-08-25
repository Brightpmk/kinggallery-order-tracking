import { getOrderStatusLabel } from "@/features/orders/status";
import type { OrderStatus } from "@/features/orders/types";

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {getOrderStatusLabel(status)}
    </span>
  );
}
