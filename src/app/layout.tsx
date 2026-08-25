import type { Metadata } from "next";
import { Playfair_Display, Great_Vibes, Cormorant_Garamond } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

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
      <body className={`${playfair.variable} ${greatVibes.variable} ${cormorant.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
