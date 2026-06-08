"use client";

import { LogOut } from "lucide-react";
import { logoutAdmin } from "@/actions/adminAuth";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => logoutAdmin()}
      className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-lg font-mono text-sm uppercase tracking-widest transition-colors backdrop-blur-md"
    >
      <LogOut size={16} />
      <span>Thoát Đặc vụ</span>
    </button>
  );
}
