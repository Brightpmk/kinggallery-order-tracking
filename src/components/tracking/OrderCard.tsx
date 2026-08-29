import type { PublicOrderSummary } from "@/features/orders/types";
import { getDeliveryMethodLabel } from "@/features/orders/jersey";
import { OrderItemList } from "./OrderItemList";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderTimeline } from "./OrderTimeline";

type OrderCardProps = {
  order: PublicOrderSummary;
};

export function OrderCard({ order }: OrderCardProps) {
  const hasDeliveryDetails =
    order.deliveryMethod || order.shippingProvider || order.trackingNumber;
  const hasTimeline = order.timeline.length > 0;

  return (
    <article className="order-card">
      <div className="order-card__header">
        <div>
          <p className="label">Order code</p>
          <h2>{order.orderCode}</h2>
          {order.createdAt ? (
            <time dateTime={order.createdAt}>{formatOrderDate(order.createdAt)}</time>
          ) : null}
        </div>
        {order.status ? <OrderStatusBadge status={order.status} /> : null}
      </div>

      <section className="order-section" aria-label="Jersey details">
        <h3>Jersey details</h3>
        <OrderItemList items={order.items} />
      </section>

      {hasDeliveryDetails ? (
        <section className="order-section" aria-label="Delivery details">
          <h3>Delivery</h3>
          <dl className="delivery-details">
            {order.deliveryMethod ? (
              <div>
                <dt>Method</dt>
                <dd>{getDeliveryMethodLabel(order.deliveryMethod)}</dd>
              </div>
            ) : null}
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
      ) : null}

      {hasTimeline ? (
        <section className="order-section timeline-section" aria-label="Order status">
          <h3>Order status</h3>
          <OrderTimeline timeline={order.timeline} />
        </section>
      ) : null}
    </article>
  );
}

function formatOrderDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium"
  }).format(new Date(value));
}
