"use client";

import { useEffect, useState, Fragment } from "react";
import { ShieldAlert, Trash2, UserCog, Loader2, ChevronDown, ChevronUp, History } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

type Order = {
  id: string;
  price: number;
  created_at: string;
  market_items: { title: string } | { title: string }[] | null;
};

type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  status?: string; // 'active', 'banned', 'deleted'
  total_spent: number;
  orders: Order[];
};

export default function UsersTab() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchUsersData = async () => {
    // Fetch profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return;
    }

    // Fetch orders to calculate spending and history
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        price,
        user_id,
        created_at,
        market_items ( title )
      `);

    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
    }

    // Merge data
    const merged: UserProfile[] = (profilesData || []).map(profile => {
      const userOrders = (ordersData || []).filter(o => o.user_id === profile.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      const totalSpent = userOrders.reduce((sum, order) => sum + (order.price || 0), 0);

      return {
        id: profile.id,
        email: profile.email || null,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        status: profile.status || 'active',
        total_spent: totalSpent,
        orders: userOrders as Order[],
      };
    });

    // Hide deleted users if we implemented soft delete
    setUsers(merged.filter(u => u.status !== 'deleted'));
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsersData();

    // Realtime changes on profiles
    const channel = supabase.channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsersData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    // Gọi Server Action
    const { updateUserStatusAction } = await import('@/app/cyber-core-xyz/actions');
    const result = await updateUserStatusAction(userId, newStatus);

    if (!result.success) {
      alert(`Lỗi khi cập nhật trạng thái: ${result.error}`);
    } else {
      // Optistic UI update to feel instantly responsive
      setUsers(prev => prev.filter(u => newStatus === 'deleted' ? u.id !== userId : true).map(u => u.id === userId ? { ...u, status: newStatus } : u));
    }
  };

  return (
    <div className="bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Quản lý Người Dùng</h2>
          <p className="text-gray-400 text-sm mt-1">Quản lý tài khoản, lịch sử mua hàng, ban/xóa hệ thống (Real-time).</p>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-full mt-20">
            <Loader2 className="animate-spin text-cyan-400 w-8 h-8" />
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10">
              <tr>
                <th scope="col" className="px-6 py-4 rounded-tl-lg">Người Dùng</th>
                <th scope="col" className="px-6 py-4">Trạng Thái</th>
                <th scope="col" className="px-6 py-4">Tổng Chi Tiêu</th>
                <th scope="col" className="px-6 py-4 text-right rounded-tr-lg">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">Chưa có người dùng nào.</td>
                </tr>
              ) : users.map((user, idx) => (
                <Fragment key={user.id}>
                  <tr 
                    className={`border-b border-white/5 transition-colors group ${
                      user.status === 'banned' ? 'bg-red-500/5' : 'hover:bg-white/5'
                    } ${idx === users.length - 1 && expandedUserId !== user.id ? "border-b-0" : ""}`}
                  >
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/20 group-hover:border-cyan-500/50 transition-colors shrink-0">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name || ""} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-cyan-900/50 flex items-center justify-center text-cyan-400 font-bold uppercase">
                            {(user.full_name || "U")[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium flex items-center gap-2">
                          {user.full_name || "Khách ẩn danh"}
                          {user.status === 'banned' && (
                            <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest border border-red-500/30">Banned</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5" title={user.id}>
                          {user.email || user.id.split('-')[0]}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider border ${
                        user.status === 'banned' 
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {user.status === 'banned' ? 'BỊ CẤM' : 'HOẠT ĐỘNG'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-cyan-400">
                      {user.total_spent.toLocaleString('vi-VN')}đ
                      <div className="text-xs text-gray-500 mt-0.5">{user.orders.length} giao dịch</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                          className={`p-2 rounded-lg transition-colors flex items-center gap-1 border ${
                            expandedUserId === user.id ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'text-gray-400 border-transparent hover:text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-500/20'
                          }`} 
                          title="Lịch sử mua hàng"
                        >
                          <History size={16} />
                          {expandedUserId === user.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        
                        {user.status === 'banned' ? (
                          <button 
                            onClick={() => handleUpdateStatus(user.id, 'active')}
                            className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors" 
                            title="Mở khóa tài khoản"
                          >
                            <UserCog size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              if(confirm(`Bạn có chắc muốn BAN tài khoản ${user.full_name}?`)) {
                                handleUpdateStatus(user.id, 'banned');
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors" 
                            title="Cấm tài khoản"
                          >
                            <ShieldAlert size={18} />
                          </button>
                        )}
                        
                        <button 
                          onClick={async () => {
                            if(confirm(`CẢNH BÁO: Bạn có chắc muốn xóa HOÀN TOÀN tài khoản ${user.full_name} khỏi database? Hành động này không thể hoàn tác!`)) {
                              const { deleteUserAction } = await import('@/app/cyber-core-xyz/actions');
                              const result = await deleteUserAction(user.id);
                              if (result.success) {
                                setUsers(prev => prev.filter(u => u.id !== user.id));
                                alert("Xóa hoàn toàn người dùng thành công!");
                              } else {
                                alert("Không thể xóa người dùng: " + result.error);
                              }
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" 
                          title="Xóa hoàn toàn người dùng"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Accordion Lịch sử mua hàng */}
                  {expandedUserId === user.id && (
                    <tr className="bg-black/80 border-b border-white/5 relative">
                      <td colSpan={4} className="p-0">
                        <div className="px-6 py-5 border-l-4 border-cyan-500 ml-4 my-2 rounded-r-xl bg-gradient-to-r from-cyan-950/40 to-transparent">
                          <h4 className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                            <History size={14} /> Lịch sử Giao dịch Chi Tiết
                          </h4>
                          {user.orders.length === 0 ? (
                            <div className="text-gray-500 text-sm py-2 italic">Người dùng này chưa có giao dịch nào trên hệ thống.</div>
                          ) : (
                            <div className="space-y-2">
                              {user.orders.map(order => {
                                const gameTitle = order.market_items ? (Array.isArray(order.market_items) ? order.market_items[0]?.title : order.market_items.title) : "Game đã xóa khỏi cửa hàng";
                                const dateObj = new Date(order.created_at);
                                const displayDate = `${dateObj.toLocaleDateString('vi-VN')} ${dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
                                
                                return (
                                  <div key={order.id} className="flex justify-between items-center text-sm bg-black/40 px-4 py-3 rounded-lg border border-white/5 hover:border-cyan-500/30 hover:bg-cyan-950/20 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                      <span className="text-gray-500 font-mono text-xs w-24">TXN-{order.id.split('-')[0].toUpperCase()}</span>
                                      <span className="text-white font-medium">{gameTitle}</span>
                                    </div>
                                    <div className="flex items-center gap-8">
                                      <span className="text-purple-400 font-mono font-bold">{order.price.toLocaleString('vi-VN')}đ</span>
                                      <span className="text-gray-500 text-xs font-mono">{displayDate}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
