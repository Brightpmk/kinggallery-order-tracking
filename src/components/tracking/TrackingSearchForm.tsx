"use client";

import { useActionState, useId, useState } from "react";
import { searchOrdersAction } from "@/features/orders/tracking-action";
import { initialTrackingSearchState } from "@/features/orders/tracking-state";
import { OrderCard } from "./OrderCard";

type SearchMode = "customer" | "jersey";

export function TrackingSearchForm() {
  const [state, formAction, isPending] = useActionState(
    searchOrdersAction,
    initialTrackingSearchState
  );
  const [searchMode, setSearchMode] = useState<SearchMode>("customer");
  const currentState = state ?? initialTrackingSearchState;
  const currentOrders = currentState.orders ?? [];
  const currentStatus = currentState.status ?? "idle";
  const currentMessage = currentState.message ?? null;
  const fullNameInputId = useId();
  const phoneNumberInputId = useId();
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
          Search with customer details or the printed jersey information shown on your order.
        </p>

        <form action={formAction} className="tracking-form">
          <fieldset>
            <legend>Search by</legend>
            <label>
              <input
                checked={searchMode === "customer"}
                name="searchMode"
                onChange={() => setSearchMode("customer")}
                type="radio"
                value="customer"
              />
              Customer information
            </label>
            <label>
              <input
                checked={searchMode === "jersey"}
                name="searchMode"
                onChange={() => setSearchMode("jersey")}
                type="radio"
                value="jersey"
              />
              Jersey information
            </label>
          </fieldset>

          {searchMode === "customer" ? (
            <div className="customer-search-fields">
              <div>
                <label className="search-field" htmlFor={fullNameInputId}>
                  Full name
                </label>
                <input
                  aria-describedby={currentMessage ? messageId : undefined}
                  autoComplete="name"
                  className="tracking-input"
                  id={fullNameInputId}
                  name="fullName"
                  placeholder="Bright Example"
                  type="text"
                />
              </div>
              <div>
                <label className="search-field" htmlFor={phoneNumberInputId}>
                  Phone number
                </label>
                <input
                  aria-describedby={currentMessage ? messageId : undefined}
                  autoComplete="tel"
                  className="tracking-input"
                  id={phoneNumberInputId}
                  inputMode="tel"
                  name="phoneNumber"
                  placeholder="096-096-9594"
                  type="text"
                />
              </div>
            </div>
          ) : (
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
          )}

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
