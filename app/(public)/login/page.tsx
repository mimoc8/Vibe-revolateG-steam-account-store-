import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import LoginClient from './LoginClient';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#020408]">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}
