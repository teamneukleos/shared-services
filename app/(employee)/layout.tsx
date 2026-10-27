"use client";

import { ReactNode, useState } from "react";
import EmployeeSidebar from "@/components/employeesidebar";
import EmployeeTopbar from "@/components/employeetopbar";

export default function EmployeeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#202020]">
      <EmployeeSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
      />

      {/* Main area */}
      <div
        className={`min-h-screen min-w-0 transition-[margin] duration-200 ${
          collapsed ? "md:ml-[76px]" : "md:ml-[264px]"
        }`}
      >
        <EmployeeTopbar onMenuClick={() => setMobileOpen(true)} />

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}