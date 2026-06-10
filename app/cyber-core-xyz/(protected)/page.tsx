"use client";
export const runtime = 'edge';

import { useState } from "react";
import { LayoutDashboard, Gamepad2, ArrowRightLeft, Users } from "lucide-react";
import DashboardTab from "@/components/admin/DashboardTab";
import GamesCrudTab from "@/components/admin/GamesCrudTab";
import TransactionsTab from "@/components/admin/TransactionsTab";
import UsersTab from "@/components/admin/UsersTab";

type TabId = "dashboard" | "games" | "transactions" | "users";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />;
      case "games":
        return <GamesCrudTab />;
      case "transactions":
        return <TransactionsTab />;
      case "users":
        return <UsersTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col h-full space-y-6">
      {/* Top Header & Navigation */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/60 border border-white/10 p-4 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(0,255,255,0.05)]">
        <div>
          <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
            REVOLATEG ADMIN
          </h1>
          <p className="text-xs text-cyan-500/70 font-mono mt-1">
            ENTERPRISE MANAGEMENT SYSTEM // v2.0
          </p>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <TabButton
            id="dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
            icon={<LayoutDashboard size={18} />}
            label="Tổng quan"
          />
          <TabButton
            id="games"
            active={activeTab === "games"}
            onClick={() => setActiveTab("games")}
            icon={<Gamepad2 size={18} />}
            label="Quản lý Game"
          />
          <TabButton
            id="transactions"
            active={activeTab === "transactions"}
            onClick={() => setActiveTab("transactions")}
            icon={<ArrowRightLeft size={18} />}
            label="Giao dịch"
          />
          <TabButton
            id="users"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            icon={<Users size={18} />}
            label="Người dùng"
          />
        </nav>
      </header>

      {/* Main Content Area */}
      <section className="flex-1 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderTabContent()}
      </section>
    </div>
  );
}

function TabButton({
  id,
  active,
  onClick,
  icon,
  label,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
        ${
          active
            ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 text-white shadow-[0_0_15px_rgba(0,255,255,0.2)]"
            : "bg-transparent border border-transparent text-gray-400 hover:text-white hover:bg-white/5"
        }
      `}
    >
      <span className={active ? "text-cyan-400" : ""}>{icon}</span>
      {label}
    </button>
  );
}

