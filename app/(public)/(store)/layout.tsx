import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Storefront",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Navbar & Footer are already provided by the root layout (app/layout.tsx).
  // This layout exists purely as a route group for future store-specific
  // middleware, loading states, or nested layouts.
  return <>{children}</>;
}
