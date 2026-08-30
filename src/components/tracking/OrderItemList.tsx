import type { PublicOrderItem } from "@/features/orders/types";
import { getJerseyColorSwatch } from "@/features/orders/jersey";
import type { CSSProperties } from "react";

type OrderItemListProps = {
  items: PublicOrderItem[];
};

export function OrderItemList({ items }: OrderItemListProps) {
  return (
    <ul className="order-items">
      {items.map((item, index) => (
        <li key={`${item.productName}-${item.shirtNumber ?? "number"}-${index}`}>
          <div className="jersey-item">
            <div className="jersey-item__title">
              <strong>{item.productName}</strong>
              <span className="quantity">x{item.quantity}</span>
            </div>
            <dl className="jersey-details">
              {item.jerseyColor ? (
                <div>
                  <dt>Color</dt>
                  <dd>
                    <span
                      className="color-value"
                      style={
                        {
                          "--swatch-color": getJerseyColorSwatch(item.jerseyColor)
                        } as CSSProperties
                      }
                    >
                      {item.jerseyColor}
                    </span>
                  </dd>
                </div>
              ) : null}
              {item.jerseySize ? (
                <div>
                  <dt>Size</dt>
                  <dd>{item.jerseySize}</dd>
                </div>
              ) : null}
              {item.printName ? (
                <div>
                  <dt>Printed name</dt>
                  <dd>{item.printName}</dd>
                </div>
              ) : null}
              {item.shirtNumber ? (
                <div>
                  <dt>Number</dt>
                  <dd>{item.shirtNumber}</dd>
                </div>
              ) : null}
              {item.universityAbbreviation ? (
                <div>
                  <dt>University</dt>
                  <dd>{item.universityAbbreviation}</dd>
                </div>
              ) : null}
              <div>
                <dt>Payment</dt>
                <dd>
                  <span
                    className={`payment-status payment-status--${item.paymentStatus}`}
                  >
                    {getPaymentStatusLabel(item.paymentStatus)}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
}

function getPaymentStatusLabel(status: PublicOrderItem["paymentStatus"]): string {
  if (status === "paid") {
    return "Paid";
  }

  if (status === "pending") {
    return "Pending";
  }

  return "Unpaid";
}
