import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TrafficTracker from "@/components/TrafficTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <TrafficTracker />
        {children}
      </body>
    </html>
  );
}

