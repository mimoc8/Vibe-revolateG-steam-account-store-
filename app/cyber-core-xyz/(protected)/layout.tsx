import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LogOut } from "lucide-react";
import LogoutButton from "./LogoutButton"; // We will create this client component

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Đọc cookie admin_token (Next.js 15 requires await)
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token");

  // Kiểm tra quyền truy cập cục bộ (không dùng Supabase Auth)
  if (!adminToken || adminToken.value !== "authorized_cybersteam_admin_session_true") {
    redirect('/cyber-core-xyz/login');
  }

  return (
    <div 
      className="flex min-h-screen w-full bg-[#050505] text-white relative"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(128, 0, 128, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    >
      <div className="absolute top-4 right-4 z-50">
        <LogoutButton />
      </div>
      <main className="flex flex-1 flex-col p-4 md:p-8 overflow-y-auto w-full pt-16 md:pt-8">{children}</main>
    </div>
  );
}
