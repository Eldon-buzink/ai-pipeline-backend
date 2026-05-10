import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Powow Dashboard",
  description: "Multi-agent AI pipeline monitoring dashboard",
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
      <body className="h-screen overflow-hidden flex flex-row bg-[var(--color-bg-primary)]">
        {/* Icon Rail Sidebar (48px collapsed, 200px expanded) */}
        <Sidebar />
        
        {/* Main Content Area (offset by sidebar width) */}
        <main className="flex-1 flex flex-col overflow-hidden ml-[var(--sidebar-width-collapsed)]">
          {children}
        </main>
      </body>
    </html>
  );
}
