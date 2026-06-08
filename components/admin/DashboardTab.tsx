"use client";

import { useEffect, useState } from "react";
import { Activity, CreditCard, Gamepad2, Users } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";



export default function DashboardTab() {
  const [realtimeUsers, setRealtimeUsers] = useState<number>(0);
  const [todayVisits, setTodayVisits] = useState<number | null>(null);
  const [totalGames, setTotalGames] = useState<number | null>(null);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [chartData, setChartData] = useState<{ name: string; revenue: number }[]>([]);

  // 1. Fetch real-time traffic (Polled every 10 seconds)
  useEffect(() => {
    const fetchRealtime = async () => {
      try {
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/page_views?select=id&created_at=gte.${fiveMinsAgo}`, {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setRealtimeUsers(data.length);
        }
      } catch (err) {
        console.error("Realtime fetch error:", err);
      }
    };
    
    fetchRealtime();
    const interval = setInterval(fetchRealtime, 10000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch heavy metrics with auto-polling
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const fetchOptions = {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
          },
          cache: 'no-store' as RequestCache,
        };

        const now = Date.now();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

        // A. Today Visits
        const visitsRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/page_views?select=id&created_at=gte.${oneDayAgo}`, fetchOptions);
        if (visitsRes.ok) {
          const visitsData = await visitsRes.json();
          setTodayVisits(visitsData.length);
        }

        // B. Total Games
        const gamesRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/market_items?select=id`, fetchOptions);
        if (gamesRes.ok) {
          const gamesData = await gamesRes.json();
          setTotalGames(gamesData.length);
        }

        // C. Revenue & Chart (from orders)
        const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/orders?select=id,price,created_at&created_at=gte.${sevenDaysAgo}`, fetchOptions);
        if (ordersRes.ok) {
          const orders = await ordersRes.json();

          // Doanh thu ngày (24h)
          const last24hRevenue = orders
            .filter((o: any) => new Date(o.created_at) >= new Date(oneDayAgo))
            .reduce((sum: number, o: any) => sum + Number(o.price), 0);
          setTotalRevenue(last24hRevenue);

          // Biểu đồ 7 ngày
          const dailyData: Record<string, number> = {};
          for (let i = 6; i >= 0; i--) {
            const d = new Date(now - i * 24 * 60 * 60 * 1000);
            const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            dailyData[dateStr] = 0;
          }

          orders.forEach((o: any) => {
            const d = new Date(o.created_at);
            const dateStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            if (dailyData[dateStr] !== undefined) {
              dailyData[dateStr] += Number(o.price);
            }
          });

          setChartData(Object.entries(dailyData).map(([name, revenue]) => ({ name, revenue })));
        }
      } catch (err) {
        console.error("Error fetching metrics:", err);
      }
    };
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Real-time Widget */}
      <div className="flex items-center space-x-3 bg-black/40 border border-cyan-500/30 p-4 rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.1)] backdrop-blur-sm w-fit">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </div>
        <span className="text-cyan-400 font-mono text-sm tracking-wider uppercase">
          Người truy cập Real-time:
        </span>
        <span className="text-white font-bold text-lg font-mono">
          {realtimeUsers.toLocaleString('en-US')}
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Lượt truy cập hôm nay"
          value={todayVisits !== null ? todayVisits.toLocaleString('vi-VN') : "..."}
          icon={<Activity className="w-5 h-5 text-purple-400" />}
          trend="Đang trực tuyến"
          trendUp={true}
        />
        <StatCard
          title="Doanh thu ngày"
          value={totalRevenue !== null ? `${totalRevenue.toLocaleString('vi-VN')}đ` : "..."}
          icon={<CreditCard className="w-5 h-5 text-emerald-400" />}
          trend="Hôm nay"
          trendUp={true}
        />
        <StatCard
          title="Tổng tài khoản game"
          value={totalGames !== null ? totalGames.toLocaleString('vi-VN') : "..."}
          icon={<Gamepad2 className="w-5 h-5 text-cyan-400" />}
          trend="+12 mới"
          trendUp={true}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-black/40 border border-white/10 p-6 rounded-xl backdrop-blur-sm shadow-xl">
        <h3 className="text-gray-400 text-sm uppercase tracking-widest font-semibold mb-6">
          Biểu đồ Doanh thu (7 ngày qua)
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#666" tick={{ fill: "#999" }} />
              <YAxis stroke="#666" tick={{ fill: "#999" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  borderColor: "rgba(0, 255, 255, 0.3)",
                  boxShadow: "0 0 10px rgba(0, 255, 255, 0.2)",
                  color: "#fff",
                }}
                itemStyle={{ color: "#0ff" }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0ff"
                strokeWidth={3}
                dot={{ fill: "#0ff", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#fff" }}
                style={{
                  filter: "drop-shadow(0px 0px 8px rgba(0, 255, 255, 0.8))",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="bg-black/40 border border-white/10 p-6 rounded-xl backdrop-blur-sm hover:border-white/20 transition-colors flex flex-col relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-gray-400 text-sm font-medium">{title}</h4>
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      </div>
      <div className="flex items-baseline space-x-2 mt-auto">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span
          className={`text-xs font-medium ${
            trendUp ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {trend}
        </span>
      </div>
    </div>
  );
}
