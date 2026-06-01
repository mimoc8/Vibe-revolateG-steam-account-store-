import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full">
      {/* TODO: Add <Sidebar /> here */}
      <main className="flex flex-1 flex-col p-8">{children}</main>
    </div>
  );
}
