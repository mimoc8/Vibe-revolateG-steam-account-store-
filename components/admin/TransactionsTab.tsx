"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

type Transaction = {
  id: string;
  price: number;
  status?: string;
  created_at: string;
  market_items?: { title: string } | { title: string }[] | null;
  profiles?: { full_name: string | null } | { full_name: string | null }[] | null;
};

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchTransactions = async () => {
      // 1. Fetch Orders and Market Items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          price,
          status,
          user_id,
          created_at,
          market_items ( title )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (ordersError) {
        console.warn("Lỗi khi fetch orders (có thể DB chưa có cột status), chuyển sang fallback:", ordersError);
        const fallback = await supabase
          .from('orders')
          .select(`id, price, user_id, created_at, market_items ( title )`)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (!fallback.error && fallback.data) {
           await mapProfilesToOrders(fallback.data);
        } else {
           setLoading(false);
        }
        return;
      }

      if (ordersData) {
        await mapProfilesToOrders(ordersData);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapProfilesToOrders = async (orders: any[]) => {
      // Lấy danh sách user_id unique
      const userIds = Array.from(new Set(orders.map((o) => o.user_id).filter(Boolean)));
      
      const profilesMap: Record<string, string> = {};
      
      if (userIds.length > 0) {
        // 2. Fetch Profiles thủ công bằng các user_id này
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
          
        if (profilesData) {
          profilesData.forEach(p => {
            profilesMap[p.id] = p.full_name || "Khách ẩn danh";
          });
        }
      }

      // 3. Ghép nối dữ liệu
      const merged = orders.map(order => ({
        ...order,
        profiles: { full_name: profilesMap[order.user_id] || order.user_id || "Khách ẩn danh" }
      }));
      
      setTransactions(merged as Transaction[]);
      setLoading(false);
    };

    fetchTransactions();
    
    // Đăng ký Real-time để tự update khi có giao dịch mới
    const channel = supabase.channel('transactions-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Lịch sử Giao dịch</h2>
        <p className="text-gray-400 text-sm mt-1">Quản lý và theo dõi các giao dịch mua game trên hệ thống (Real-time).</p>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-full mt-20">
            <Loader2 className="animate-spin text-cyan-400 w-8 h-8" />
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th scope="col" className="px-6 py-4 rounded-tl-lg">Mã GD</th>
                <th scope="col" className="px-6 py-4">Tên Game</th>
                <th scope="col" className="px-6 py-4">Người Dùng</th>
                <th scope="col" className="px-6 py-4">Số Tiền</th>
                <th scope="col" className="px-6 py-4">Trạng Thái</th>
                <th scope="col" className="px-6 py-4 rounded-tr-lg">Ngày/Giờ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">Chưa có giao dịch nào.</td>
                </tr>
              ) : transactions.map((txn, idx) => {
                // Determine format based on relation arrays
                let gameTitle = "Không xác định";
                if (txn.market_items) {
                   gameTitle = Array.isArray(txn.market_items) ? txn.market_items[0]?.title : txn.market_items.title;
                }
                
                let userEmail = "Khách ẩn danh";
                if (txn.profiles) {
                   userEmail = Array.isArray(txn.profiles) ? (txn.profiles[0]?.full_name || "Khách ẩn danh") : (txn.profiles.full_name || "Khách ẩn danh");
                }

                // Cắt lấy 8 ký tự đầu của UUID làm mã giao dịch cho gọn
                const shortId = "TXN-" + txn.id.split('-')[0].toUpperCase();
                const displayPrice = txn.price != null ? `${txn.price.toLocaleString('vi-VN')}đ` : "0đ";
                const dateObj = new Date(txn.created_at);
                const displayDate = `${dateObj.toLocaleDateString('vi-VN')} ${dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
                
                // Mặc định giao dịch luôn thành công nếu DB không có cột status
                const currentStatus = txn.status || "success";

                return (
                  <tr 
                    key={txn.id} 
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                      idx === transactions.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-mono text-cyan-400">{shortId}</td>
                    <td className="px-6 py-4 font-medium text-white max-w-[200px] truncate" title={gameTitle || ""}>{gameTitle || "Không xác định"}</td>
                    <td className="px-6 py-4 truncate max-w-[150px]" title={userEmail || ""}>{userEmail || "Khách ẩn danh"}</td>
                    <td className="px-6 py-4 text-purple-400 font-mono">{displayPrice}</td>
                    <td className="px-6 py-4">
                      {currentStatus === "success" || currentStatus === "completed" || currentStatus === "paid" ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full w-fit border border-emerald-400/20 whitespace-nowrap">
                          <CheckCircle2 size={14} /> Thành công
                        </span>
                      ) : currentStatus === "failed" || currentStatus === "cancelled" ? (
                        <span className="flex items-center gap-1.5 text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded-full w-fit border border-rose-400/20 whitespace-nowrap">
                          <XCircle size={14} /> Thất bại
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full w-fit border border-amber-400/20 whitespace-nowrap">
                          <Clock size={14} /> Chờ xử lý
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs whitespace-nowrap">{displayDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
