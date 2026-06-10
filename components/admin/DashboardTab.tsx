"use client";

import { useEffect, useState } from "react";
import { Activity, CreditCard, Gamepad2, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { createBrowserClient } from "@supabase/ssr";

const RevenueChart = dynamic(() => import("./RevenueChart"), { ssr: false });

export default function DashboardTab() {
  const [realtimeUsers, setRealtimeUsers] = useState<number>(0);
  const [todayVisits, setTodayVisits] = useState<number>(0);
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
    <div className="space-y-8">
      {/* Real-time Widget & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide">TỔNG QUAN HỆ THỐNG</h2>
          <p className="text-gray-400 text-sm mt-1">Theo dõi các chỉ số hoạt động theo thời gian thực</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-black/60 border border-cyan-500/50 p-3 px-5 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.15)] backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500 shadow-[0_0_8px_rgba(0,255,255,0.8)]"></span>
          </div>
          <span className="text-cyan-400/80 font-mono text-sm tracking-wider uppercase">
            Real-time Users:
          </span>
          <span className="text-white font-bold text-xl font-mono drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
            {realtimeUsers.toLocaleString('en-US')}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="LƯỢT TRUY CẬP HÔM NAY"
          value={todayVisits.toLocaleString('vi-VN')}
          icon={<Activity className="w-6 h-6 text-purple-400" />}
          trend="Đang trực tuyến"
          trendUp={true}
          glowColor="rgba(168,85,247,0.15)"
        />
        <StatCard
          title="DOANH THU NGÀY"
          value={totalRevenue !== null ? `${totalRevenue.toLocaleString('vi-VN')}đ` : "0đ"}
          icon={<CreditCard className="w-6 h-6 text-emerald-400" />}
          trend="Hôm nay"
          trendUp={true}
          glowColor="rgba(16,185,129,0.15)"
        />
        <StatCard
          title="TỔNG TÀI KHOẢN GAME"
          value={totalGames !== null ? totalGames.toLocaleString('vi-VN') : "0"}
          icon={<Gamepad2 className="w-6 h-6 text-cyan-400" />}
          trend="+12 mới"
          trendUp={true}
          glowColor="rgba(6,182,212,0.15)"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-black/40 border border-white/10 p-6 rounded-xl backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        <h3 className="text-gray-400 text-sm uppercase tracking-widest font-semibold mb-6 flex items-center">
          <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2 shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
          Biểu đồ Doanh thu (7 ngày qua)
        </h3>
        <div className="w-full h-80 min-h-[320px]">
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
  glowColor,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  glowColor: string;
}) {
  return (
    <div className="group bg-white/[0.02] border border-white/10 p-6 rounded-xl backdrop-blur-md hover:border-white/30 hover:bg-white/[0.04] transition-all duration-300 flex flex-col relative overflow-hidden"
         style={{ boxShadow: `0 0 0 0 ${glowColor}` }}
         onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 0 30px 0 ${glowColor}`}
         onMouseLeave={(e) => e.currentTarget.style.boxShadow = `0 0 0 0 ${glowColor}`}
    >
      {/* Subtle background glow */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-50 group-hover:opacity-100" 
        style={{ backgroundColor: glowColor }} 
      />
      
      <div className="flex justify-between items-start mb-6">
        <h4 className="text-gray-400 text-xs tracking-wider font-semibold z-10">{title}</h4>
        <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform duration-300 shadow-inner z-10">
          {icon}
        </div>
      </div>
      <div className="flex items-baseline justify-between mt-auto z-10">
        <span className="text-3xl font-bold text-white tracking-tight drop-shadow-md">{value}</span>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm ${
            trendUp ? "text-emerald-400 bg-emerald-400/10 border border-emerald-400/20" : "text-rose-400 bg-rose-400/10 border border-rose-400/20"
          }`}
        >
          {trend}
        </span>
      </div>
    </div>
  );
}
