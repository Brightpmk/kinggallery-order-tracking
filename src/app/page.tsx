import { mockOrders } from "@/features/orders/mock-orders";
import { toPublicOrderSummary } from "@/features/orders/public-order";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export default function Home() {
  const sampleOrder = toPublicOrderSummary(mockOrders[0]);
  const supabaseConfigured = getSupabasePublicConfig() !== null;

  return (
    <main className="page">
      <section className="intro">
        <p className="eyebrow">Phase 1 Foundation</p>
        <h1>Delivery tracking for clothing orders</h1>
        <p className="lede">
          A small production-ready base for customer order tracking, admin order
          management, and future Google Forms synchronization.
        </p>
      </section>

      <section className="grid" aria-label="Project foundation status">
        <div className="panel">
          <h2>Architecture</h2>
          <ul>
            <li>Next.js App Router with TypeScript strict mode.</li>
            <li>Order domain types live outside route components.</li>
            <li>Supabase clients are isolated by browser and server usage.</li>
          </ul>
        </div>

        <div className="panel">
          <h2>Mock data</h2>
          <dl className="summary-list">
            <div>
              <dt>Orders</dt>
              <dd>{mockOrders.length}</dd>
            </div>
            <div>
              <dt>Sample ID</dt>
              <dd>{sampleOrder.orderId}</dd>
            </div>
            <div>
              <dt>Public status</dt>
              <dd>{sampleOrder.status}</dd>
            </div>
          </dl>
        </div>

        <div className="panel">
          <h2>Supabase</h2>
          <p>
            Public configuration is{" "}
            <strong>{supabaseConfigured ? "present" : "not configured"}</strong>.
            The app can run with mock data until real database credentials are
            added locally or in Vercel.
          </p>
        </div>
      </section>
    </main>
  );
}
