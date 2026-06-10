import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthListener from "@/components/providers/AuthListener";
import CacheBuster from "@/components/providers/CacheBuster";
import AnalyticsTracker from "@/components/AnalyticsTracker";


export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AnalyticsTracker />
      <CacheBuster />
      <AuthListener />
      <Navbar initialUser={null} initialProfile={null} />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}

