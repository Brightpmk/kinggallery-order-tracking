"use client";

import { useActionState, useId, useState } from "react";
import { searchCustomerOrdersAction } from "@/features/orders/tracking-action";
import { initialTrackingSearchState } from "@/features/orders/tracking-state";
import { OrderCard } from "./OrderCard";

export function TrackingSearchForm() {
  const [searchType, setSearchType] = useState<"name" | "phone">("name");
  const [state, formAction, isPending] = useActionState(
    searchCustomerOrdersAction,
    initialTrackingSearchState
  );
  const currentState = state ?? initialTrackingSearchState;
  const currentOrders = currentState.orders ?? [];
  const currentStatus = currentState.status ?? "idle";
  const currentMessage = currentState.message ?? null;
  const inputId = useId();
  const messageId = useId();

  return (
    <section className="tracking-workspace" aria-labelledby="tracking-title">
      <div className="tracking-form-panel">
        <p className="eyebrow">Jersey Order Tracking</p>
        <h1 id="tracking-title">Check your jersey order status</h1>
        <p className="lede">
          Search with the same full name or phone number used when placing the
          jersey order.
        </p>

        <form action={formAction} className="tracking-form">
          <fieldset>
            <legend>Search by</legend>
            <label>
              <input
                checked={searchType === "name"}
                name="searchType"
                onChange={() => setSearchType("name")}
                type="radio"
                value="name"
              />
              Full name
            </label>
            <label>
              <input
                checked={searchType === "phone"}
                name="searchType"
                onChange={() => setSearchType("phone")}
                type="radio"
                value="phone"
              />
              Phone number
            </label>
          </fieldset>

          <label className="search-field" htmlFor={inputId}>
            {searchType === "name" ? "Full name" : "Phone number"}
          </label>
          <input
            aria-describedby={currentMessage ? messageId : undefined}
            autoComplete={searchType === "name" ? "name" : "tel"}
            id={inputId}
            name="query"
            placeholder={
              searchType === "name" ? "Alex Sample" : "+66 80 000 1001"
            }
            type={searchType === "name" ? "text" : "tel"}
          />

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

        {currentOrders.map((order) => (
          <OrderCard key={order.orderCode} order={order} />
        ))}
      </div>
    </section>
  );
}
