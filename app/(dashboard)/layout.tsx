
"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(264);

  return (
    <div
      style={{ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties}
    >
      <AppSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onWidthChange={setSidebarWidth}
      />

      <AppTopbar
        sidebarWidth={sidebarWidth}
        onMenuClick={() => setMobileOpen(true)}
      />

      <main className="min-h-screen pt-[72px] md:ml-[var(--sidebar-width)] md:pt-[82px]">
        <div className="min-w-0 p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
