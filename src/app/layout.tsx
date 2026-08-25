import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jersey Order Tracking",
  description: "Check university jersey order status with a customer-safe lookup."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
