"use client";

import { useActionState, useId } from "react";
import { searchJerseyOrdersAction } from "@/features/orders/tracking-action";
import { initialTrackingSearchState } from "@/features/orders/tracking-state";
import { OrderCard } from "./OrderCard";

export function TrackingSearchForm() {
  const [state, formAction, isPending] = useActionState(
    searchJerseyOrdersAction,
    initialTrackingSearchState
  );
  const currentState = state ?? initialTrackingSearchState;
  const currentOrders = currentState.orders ?? [];
  const currentStatus = currentState.status ?? "idle";
  const currentMessage = currentState.message ?? null;
  const printNameInputId = useId();
  const shirtNumberInputId = useId();
  const messageId = useId();

  return (
    <section className="tracking-workspace" aria-labelledby="tracking-title">
      <div className="tracking-form-panel">
        <p className="eyebrow">Jersey Order Tracking</p>
        <div className="hero-title-wrapper">
          <span className="hero-script-accent" aria-hidden="true">
            Check your status
          </span>
          <h1 id="tracking-title">Check your jersey order status</h1>
        </div>
        <p className="lede">
          Search with the printed name and jersey number shown on your order.
        </p>

        <form action={formAction} className="tracking-form">
          <div className="jersey-search-fields">
            <div>
              <label className="search-field" htmlFor={printNameInputId}>
                Printed name
              </label>
              <input
                aria-describedby={currentMessage ? messageId : undefined}
                autoComplete="off"
                className="tracking-input"
                id={printNameInputId}
                name="printName"
                placeholder="BRIGHT"
                type="text"
              />
            </div>
            <div>
              <label className="search-field" htmlFor={shirtNumberInputId}>
                Jersey number
              </label>
              <input
                aria-describedby={currentMessage ? messageId : undefined}
                autoComplete="off"
                className="tracking-input"
                id={shirtNumberInputId}
                name="shirtNumber"
                placeholder="67"
                type="text"
              />
            </div>
          </div>

          <button disabled={isPending} type="submit">
            {isPending ? "Checking..." : "Check Order Status"}
          </button>
        </form>

        {currentMessage ? (
          <p
            className={`form-message form-message--${currentStatus}`}
            id={messageId}
            role={currentStatus === "success" ? "status" : "alert"}
          >
            {currentMessage}
          </p>
        ) : null}
      </div>

      <div className="tracking-results" aria-live="polite">
        {currentStatus === "idle" ? (
          <div className="empty-state">
            <h2>Matching jerseys will appear here</h2>
            <p>No jersey information is shown before a search.</p>
          </div>
        ) : null}

        {currentOrders.map((order, index) => (
          <OrderCard key={`${order.orderCode}-${index}`} order={order} />
        ))}
      </div>
    </section>
  );
}
