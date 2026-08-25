import type { PublicOrderSummary } from "@/features/orders/types";
import { getDeliveryMethodLabel } from "@/features/orders/jersey";
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

      <section className="order-section" aria-label="Jersey details">
        <h3>Jersey details</h3>
        <OrderItemList items={order.items} />
      </section>

      <section className="order-section" aria-label="Delivery details">
        <h3>Delivery</h3>
        <dl className="delivery-details">
          <div>
            <dt>Method</dt>
            <dd>{getDeliveryMethodLabel(order.deliveryMethod)}</dd>
          </div>
          {order.deliveryMethod === "shipping" ? (
            <>
              <div>
                <dt>Shipping provider</dt>
                <dd>{order.shippingProvider ?? "Provider not available yet"}</dd>
              </div>
              <div>
                <dt>Tracking number</dt>
                <dd>
                  {order.trackingNumber ?? "Tracking number not available yet"}
                </dd>
              </div>
            </>
          ) : null}
        </dl>
      </section>

      <section className="order-section timeline-section" aria-label="Order status">
        <h3>Order status</h3>
        <OrderTimeline timeline={order.timeline} />
      </section>
    </article>
  );
}

function formatOrderDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(new Date(value));
}
