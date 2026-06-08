import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== 'luzmiuforerver@gmail.com') {
    redirect('/cyber-core-xyz/login');
  }

  return (
    <div 
      className="flex min-h-screen w-full bg-[#050505] text-white"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(128, 0, 128, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    >
      <main className="flex flex-1 flex-col p-4 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
