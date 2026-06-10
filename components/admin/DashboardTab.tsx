"use client";

import { useEffect, useState } from "react";
import { Activity, CreditCard, Gamepad2, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { createBrowserClient } from "@supabase/ssr";

const RevenueChart = dynamic(() => import("./RevenueChart"), { ssr: false });

export default function DashboardTab() {
  const [realtimeUsers, setRealtimeUsers] = useState<number>(120);
  const [todayVisits, setTodayVisits] = useState<number>(1245);
  const [totalGames, setTotalGames] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [chartData, setChartData] = useState<{ name: string; revenue: number }[]>([]);

  // 1. Initialize Supabase Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 2. Initial Load (Static state)
  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      try {
        const now = Date.now();
        const startOfTodayISO = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

        // Fetch today's visits
        const { count: visitsCount, error: visitsError } = await supabase
          .from('page_views')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfTodayISO);
          
        if (visitsError) throw visitsError;

        // Fetch total games
        const { count: gamesCount, error: gamesError } = await supabase
          .from("market_items")
          .select("id", { count: "exact", head: true });

        if (gamesError) throw gamesError;

        // Fetch revenue for last 7 days
        const { data: orders, error: ordersError } = await supabase
          .from("orders")
          .select("id, price, created_at")
          .gte("created_at", sevenDaysAgo);

        if (ordersError) throw ordersError;

        if (!isMounted) return;

        setTotalGames(gamesCount ?? 0);
        setTodayVisits(visitsCount ?? 0);

        // Calculate today's revenue
        const last24hRevenue = orders
          .filter((o: any) => new Date(o.created_at) >= new Date(oneDayAgo))
          .reduce((sum: number, o: any) => sum + Number(o.price || 0), 0);
        
        setTotalRevenue(last24hRevenue);

        // Build 7-day chart data
        const dailyData: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now - i * 24 * 60 * 60 * 1000);
          const dateStr = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
          dailyData[dateStr] = 0;
        }

        if (Array.isArray(orders)) {
          orders.forEach((o: any) => {
            const d = new Date(o.created_at);
            const dateStr = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
            if (dailyData[dateStr] !== undefined) {
              dailyData[dateStr] += Number(o.price || 0);
            }
          });
        }

        setChartData(Object.entries(dailyData).map(([name, revenue]) => ({ name, revenue })));

      } catch (error) {
        console.error("Failed to fetch initial dashboard data:", error);
        // Robust fallback
        if (isMounted) {
          setTotalGames(0);
          setTotalRevenue(0);
          const sampleData = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dateStr = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
            sampleData.push({ name: dateStr, revenue: 0 });
          }
          setChartData(sampleData);
        }
      }
    };

    fetchInitialData();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // 3. Real-time Subscription (WebSockets)
  useEffect(() => {
    const channel = supabase.channel('dashboard-metrics')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        console.log('Real-time order received!', payload);
        const newPrice = Number(payload.new.price || 0);
        
        // Dynamically add to today's revenue state
        setTotalRevenue((prev) => (prev ?? 0) + newPrice);
        
        // Dynamically update the chart data state
        setChartData((prev) => {
          if (!prev || prev.length === 0) return prev;
          const updatedChart = [...prev];
          const lastIndex = updatedChart.length - 1;
          updatedChart[lastIndex] = {
            ...updatedChart[lastIndex],
            revenue: updatedChart[lastIndex].revenue + newPrice
          };
          return updatedChart;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // 4. Real-time Users Presence Subscription (via Window Event from TrafficTracker)
  useEffect(() => {
    const handlePresence = (e: any) => {
      setRealtimeUsers(e.detail);
    };

    window.addEventListener('presence-sync', handlePresence);
    
    return () => {
      window.removeEventListener('presence-sync', handlePresence);
    };
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
          value={todayVisits.toLocaleString('vi-VN')}
          icon={<Activity className="w-5 h-5 text-purple-400" />}
          trend="Đang trực tuyến"
          trendUp={true}
        />
        <StatCard
          title="Doanh thu ngày"
          value={totalRevenue !== null ? `${totalRevenue.toLocaleString('vi-VN')}đ` : "0đ"}
          icon={<CreditCard className="w-5 h-5 text-emerald-400" />}
          trend="Hôm nay"
          trendUp={true}
        />
        <StatCard
          title="Tổng tài khoản game"
          value={totalGames !== null ? totalGames.toLocaleString('vi-VN') : "0"}
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
        <div className="w-full h-72 min-h-[300px]">
          <RevenueChart data={chartData} />
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
