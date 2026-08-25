import type { PublicOrderSummary } from "@/features/orders/types";
import { OrderItemList } from "./OrderItemList";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderTimeline } from "./OrderTimeline";

type OrderCardProps = {
  order: PublicOrderSummary;
};

export function OrderCard({ order }: OrderCardProps) {
  return (
    <article className="order-card">
      <div className="order-card__header">
        <div>
          <p className="label">Order code</p>
          <h2>{order.orderCode}</h2>
          <time dateTime={order.createdAt}>{formatOrderDate(order.createdAt)}</time>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <OrderItemList items={order.items} />

      <dl className="delivery-details">
        <div>
          <dt>Shipping provider</dt>
          <dd>{order.shippingProvider ?? "Not available yet"}</dd>
        </div>
        <div>
          <dt>Tracking number</dt>
          <dd>{order.trackingNumber ?? "Not available yet"}</dd>
        </div>
      </dl>

      <div className="timeline-section">
        <h3>Status timeline</h3>
        <OrderTimeline timeline={order.timeline} />
      </div>
    </article>
  );
}

function formatOrderDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(new Date(value));
}
