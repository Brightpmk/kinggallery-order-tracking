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
              <div>
                <dt>Color</dt>
                <dd>
                  {item.jerseyColor ? (
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
                  ) : (
                    "Not set"
                  )}
                </dd>
              </div>
              <div>
                <dt>Size</dt>
                <dd>{item.jerseySize ?? "Not set"}</dd>
              </div>
              <div>
                <dt>Printed name</dt>
                <dd>{item.printName ?? "Not set"}</dd>
              </div>
              <div>
                <dt>Number</dt>
                <dd>{item.shirtNumber ?? "Not set"}</dd>
              </div>
              <div>
                <dt>University</dt>
                <dd>{item.universityAbbreviation ?? "Not set"}</dd>
              </div>
            </dl>
          </div>
        </li>
      ))}
    </ul>
  );
}
