"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";

const mockTransactions = [
  { id: "TXN-9021", game: "Cyberpunk 2077", user: "neo@matrix.com", amount: "990,000đ", status: "success", date: "2026-06-05 14:30" },
  { id: "TXN-9022", game: "Elden Ring", user: "tarnished@grace.com", amount: "1,200,000đ", status: "pending", date: "2026-06-06 09:15" },
  { id: "TXN-9023", game: "Red Dead Redemption 2", user: "arthur@morgan.com", amount: "450,000đ", status: "success", date: "2026-06-06 10:05" },
  { id: "TXN-9024", game: "Baldur's Gate 3", user: "tav@faerun.com", amount: "1,150,000đ", status: "failed", date: "2026-06-06 10:22" },
  { id: "TXN-9025", game: "Hollow Knight", user: "ghost@hallownest.com", amount: "150,000đ", status: "success", date: "2026-06-06 11:45" },
];

export default function TransactionsTab() {
  return (
    <div className="bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">Lịch sử Giao dịch</h2>
        <p className="text-gray-400 text-sm mt-1">Quản lý và theo dõi các giao dịch mua game trên hệ thống.</p>
      </div>

      <div className="overflow-x-auto">
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
            {mockTransactions.map((txn, idx) => (
              <tr 
                key={txn.id} 
                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                  idx === mockTransactions.length - 1 ? "border-b-0" : ""
                }`}
              >
                <td className="px-6 py-4 font-mono text-cyan-400">{txn.id}</td>
                <td className="px-6 py-4 font-medium text-white">{txn.game}</td>
                <td className="px-6 py-4">{txn.user}</td>
                <td className="px-6 py-4 text-purple-400 font-mono">{txn.amount}</td>
                <td className="px-6 py-4">
                  {txn.status === "success" && (
                    <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full w-fit border border-emerald-400/20">
                      <CheckCircle2 size={14} /> Thành công
                    </span>
                  )}
                  {txn.status === "pending" && (
                    <span className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full w-fit border border-amber-400/20">
                      <Clock size={14} /> Chờ xử lý
                    </span>
                  )}
                  {txn.status === "failed" && (
                    <span className="flex items-center gap-1.5 text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded-full w-fit border border-rose-400/20">
                      <XCircle size={14} /> Thất bại
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{txn.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
