import type { PublicOrderSummary } from "@/features/orders/types";
import { getDeliveryMethodLabel } from "@/features/orders/jersey";
import { getOrderStatusLabel } from "@/features/orders/order-status";
import { OrderItemList } from "./OrderItemList";

type OrderCardProps = {
  order: PublicOrderSummary;
};

export function OrderCard({ order }: OrderCardProps) {
  const hasDeliveryDetails = Boolean(order.orderStatus || order.deliveryMethod);

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
      </div>

      <section className="order-section" aria-label="Jersey details">
        <h3>Jersey details</h3>
        <OrderItemList items={order.items} />
      </section>

      {hasDeliveryDetails ? (
        <section className="order-section" aria-label="Delivery details">
          <h3>Delivery</h3>
          <dl className="delivery-details">
            {order.orderStatus ? (
              <div>
                <dt>Status</dt>
                <dd>{getOrderStatusLabel(order.orderStatus)}</dd>
              </div>
            ) : null}
            {order.deliveryMethod ? (
              <div>
                <dt>Method</dt>
                <dd>{getDeliveryMethodLabel(order.deliveryMethod)}</dd>
              </div>
            ) : null}
          </dl>
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
