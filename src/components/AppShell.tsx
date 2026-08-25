import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      {/* Decorative silk/drape background layers */}
      <div className="silk-backdrop" aria-hidden="true" />
      <div className="silk-sparkle" aria-hidden="true" />

      <header className="site-header">
        <div className="site-header__inner">
          <div className="brand" aria-label="Delivery Tracking">
            <span className="brand__name">Delivery Tracking</span>
            <span className="brand__detail">KingGallery.Studio</span>
          </div>
          <nav className="site-nav" aria-label="Planned application areas">
            <span>Customer tracking</span>
            <span>Admin orders</span>
            <span>Forms sync</span>
          </nav>
        </div>
      </header>
      {children}
      <footer className="site-footer">
        Built for private order status lookup. Sensitive customer details stay
        server-side by default.
      </footer>
    </div>
  );
}
