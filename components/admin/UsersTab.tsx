"use client";

import { ShieldAlert, Trash2, UserCog } from "lucide-react";

const mockUsers = [
  { id: "USR-001", email: "admin@cybersteam.com", role: "admin", spent: "15,400,000đ", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin" },
  { id: "USR-002", email: "neo@matrix.com", role: "user", spent: "990,000đ", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=neo" },
  { id: "USR-003", email: "tarnished@grace.com", role: "user", spent: "4,500,000đ", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tarnished" },
  { id: "USR-004", email: "arthur@morgan.com", role: "user", spent: "1,200,000đ", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arthur" },
];

export default function UsersTab() {
  return (
    <div className="bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Quản lý Người Dùng</h2>
          <p className="text-gray-400 text-sm mt-1">Danh sách tài khoản thành viên hệ thống.</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-white/5 border-b border-white/10">
            <tr>
              <th scope="col" className="px-6 py-4 rounded-tl-lg">Người Dùng</th>
              <th scope="col" className="px-6 py-4">Vai Trò</th>
              <th scope="col" className="px-6 py-4">Tổng Chi Tiêu</th>
              <th scope="col" className="px-6 py-4 text-right rounded-tr-lg">Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user, idx) => (
              <tr 
                key={user.id} 
                className={`border-b border-white/5 hover:bg-white/5 transition-colors group ${
                  idx === mockUsers.length - 1 ? "border-b-0" : ""
                }`}
              >
                <td className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/20 group-hover:border-cyan-500/50 transition-colors">
                    <img src={user.avatar} alt={user.email} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{user.email}</div>
                    <div className="text-xs text-gray-500 font-mono">{user.id}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    user.role === 'admin' 
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                      : 'bg-white/5 text-gray-300 border-white/10'
                  }`}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono text-cyan-400">{user.spent}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors" title="Phân quyền">
                      <UserCog size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors" title="Cấm tài khoản">
                      <ShieldAlert size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="Xóa người dùng">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
