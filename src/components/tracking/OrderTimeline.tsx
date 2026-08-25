import { getOrderStatusLabel } from "@/features/orders/status";
import type { OrderTimelineEvent } from "@/features/orders/types";

type OrderTimelineProps = {
  timeline: OrderTimelineEvent[];
};

export function OrderTimeline({ timeline }: OrderTimelineProps) {
  if (timeline.length === 0) {
    return null;
  }

  return (
    <ol className="timeline">
      {timeline.map((event) => (
        <li key={`${event.status}-${event.occurredAt}`}>
          <div>
            <strong>{getOrderStatusLabel(event.status)}</strong>
            <time dateTime={event.occurredAt}>{formatOrderDate(event.occurredAt)}</time>
          </div>
          {event.note ? <p>{event.note}</p> : null}
        </li>
      ))}
    </ol>
  );
}

function formatOrderDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
