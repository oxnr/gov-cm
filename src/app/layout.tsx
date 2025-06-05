import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GovChime - Government Contract Intelligence",
  description: "Discover, analyze, and track government contracts and grants with powerful AI-driven insights and real-time market intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors">
          <div className="bg-pattern" />
          <Navigation />
          <main className="relative z-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
