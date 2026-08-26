"use client";

import { useActionState, useId, useState } from "react";
import { searchCustomerOrdersAction } from "@/features/orders/tracking-action";
import { initialTrackingSearchState } from "@/features/orders/tracking-state";
import { OrderCard } from "./OrderCard";

export function TrackingSearchForm() {
  const [searchMode, setSearchMode] = useState<"customer" | "jersey">(
    "customer"
  );
  const [customerSearchType, setCustomerSearchType] = useState<"name" | "phone">(
    "name"
  );
  const [state, formAction, isPending] = useActionState(
    searchCustomerOrdersAction,
    initialTrackingSearchState
  );
  const currentState = state ?? initialTrackingSearchState;
  const currentOrders = currentState.orders ?? [];
  const currentStatus = currentState.status ?? "idle";
  const currentMessage = currentState.message ?? null;
  const customerInputId = useId();
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
          Search by customer details, or find one jersey with the printed name
          and number.
        </p>

        <form action={formAction} className="tracking-form">
          <fieldset>
            <legend>Mode</legend>
            <label>
              <input
                checked={searchMode === "customer"}
                name="searchMode"
                onChange={() => setSearchMode("customer")}
                type="radio"
                value="customer"
              />
              Customer
            </label>
            <label>
              <input
                checked={searchMode === "jersey"}
                name="searchMode"
                onChange={() => setSearchMode("jersey")}
                type="radio"
                value="jersey"
              />
              Jersey
            </label>
          </fieldset>

          {searchMode === "customer" ? (
            <>
              <fieldset>
                <legend>Customer search</legend>
                <label>
                  <input
                    checked={customerSearchType === "name"}
                    name="customerSearchType"
                    onChange={() => setCustomerSearchType("name")}
                    type="radio"
                    value="name"
                  />
                  Full name
                </label>
                <label>
                  <input
                    checked={customerSearchType === "phone"}
                    name="customerSearchType"
                    onChange={() => setCustomerSearchType("phone")}
                    type="radio"
                    value="phone"
                  />
                  Phone number
                </label>
              </fieldset>

              <label className="search-field" htmlFor={customerInputId}>
                {customerSearchType === "name" ? "Full name" : "Phone number"}
              </label>
              <input
                aria-describedby={currentMessage ? messageId : undefined}
                autoComplete={customerSearchType === "name" ? "name" : "tel"}
                className="tracking-input"
                id={customerInputId}
                name="customerQuery"
                placeholder={
                  customerSearchType === "name"
                    ? "Alex Sample"
                    : "+66 80 000 1001"
                }
                type={customerSearchType === "name" ? "text" : "tel"}
              />
            </>
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
            <h2>Orders will appear here</h2>
            <p>No order information is shown before a search.</p>
          </div>
        ) : null}

        {currentOrders.map((order, index) => (
          <OrderCard key={`${order.orderCode}-${index}`} order={order} />
        ))}
      </div>
    </section>
  );
}
