'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';
import { loginAdmin } from '@/actions/adminAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await loginAdmin(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        router.push('/cyber-core-xyz');
        router.refresh();
      }
    } catch (err: any) {
      setError("Lỗi hệ thống: Không thể kết nối đến máy chủ xác thực.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#050505] text-white p-4"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(128, 0, 128, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}>
      
      <div className="w-full max-w-md bg-black/80 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-xl shadow-[0_0_30px_rgba(0,245,255,0.15)] relative overflow-hidden">
        {/* Cyberpunk Accents */}
        <span className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
        <span className="absolute bottom-0 right-0 h-16 w-16 border-b-2 border-r-2 border-cyan-500/50" />
        <span className="absolute top-0 left-0 h-16 w-16 border-t-2 border-l-2 border-purple-500/50" />

        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/50 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(0,245,255,0.2)]">
            <ShieldAlert className="text-cyan-400 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 uppercase">
            RESTRICTED AREA
          </h1>
          <p className="text-xs text-cyan-500/70 font-mono mt-2 tracking-widest uppercase">
            Admin Authentication Required
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded border border-red-500/50 bg-red-500/10 text-red-400 text-xs font-mono text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              ID Đặc vụ (Username)
            </label>
            <input
              name="email"
              type="text"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400 font-mono transition-colors"
              placeholder="admin"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              Mã bảo mật (Password)
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400 font-mono transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative group overflow-hidden rounded-lg p-[1px] mt-2"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-70 group-hover:opacity-100 transition-opacity"></span>
            <div className="relative flex items-center justify-center gap-2 bg-black group-hover:bg-transparent rounded-lg px-8 py-3 transition-colors">
              {isLoading ? (
                <Loader2 className="animate-spin text-white w-5 h-5" />
              ) : (
                <span className="text-white font-mono font-bold tracking-widest uppercase text-sm">
                  Cấp quyền truy cập
                </span>
              )}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}

