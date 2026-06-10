import type { Metadata } from "next";
import "./globals.css";
import TrafficTracker from "@/components/TrafficTracker";

export const metadata: Metadata = {
  title: {
    default: "RevolateG — Game Account Marketplace",
    template: "%s | RevolateG",
  },
  description:
    "Buy and sell premium Steam game accounts in the ultimate cyberpunk marketplace. Secure, fast, and trusted.",
  keywords: ["steam accounts", "game marketplace", "buy steam accounts", "revolateg"],
  verification: {
    google: "ljyy8rH0SvQH_eiD7z3UF7KFfqJ5HzSxXgN-1YGOLWs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased font-sans"
    >
      <body className="flex min-h-full flex-col font-sans bg-[var(--color-cyber-black)]" suppressHydrationWarning>
        <TrafficTracker />
        {children}
      </body>
    </html>
  );
}

