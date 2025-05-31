
import React from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex items-center gap-2 p-4 border-b border-slate-800">
            <SidebarTrigger className="text-slate-300 hover:text-white hover:bg-slate-800" />
            <h1 className="text-2xl font-bold text-white">DW Marketing - Manager</h1>
          </div>
          <div className="flex-1">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
