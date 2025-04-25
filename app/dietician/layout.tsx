"use client";

import { ReactNode, useState } from "react";
import Sidebar from "@/components/dietician/layout/Sidebar";
import Header from "@/components/dietician/layout/Header";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import MobileSidebar from "@/components/dietician/layout/MobileSidebar";

const inter = Inter({ subsets: ["latin"] });

export default function DieticianLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={cn("min-h-screen bg-background", inter.className)}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <MobileSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}