
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import { UsersTab } from "@/components/dashboard/UsersTab";
import { BusinessManagersTab } from "@/components/dashboard/BusinessManagersTab";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

interface DashboardRoutesProps {
  pathname: string;
  isAdmin: boolean;
  hasPageAccess: (page: string) => boolean;
}

export const DashboardRoutes: React.FC<DashboardRoutesProps> = ({
  pathname,
  isAdmin,
  hasPageAccess,
}) => {
  // Users page
  if (pathname === '/users' && isAdmin && hasPageAccess('users')) {
    return (
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-slate-50 light:via-slate-100 light:to-slate-50">
          <div className="container mx-auto p-6">
            <DashboardHeader
              title="Manager"
              description="Gerenciamento de usuários"
            />

            <Card className="bg-slate-900/50 dark:bg-slate-900/50 light:bg-white border-slate-800 dark:border-slate-800 light:border-slate-200 backdrop-blur-sm">
              <CardContent className="p-6">
                <UsersTab />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    );
  }

  // Business managers page
  if (pathname === '/business-managers' && isAdmin && hasPageAccess('businessManagers')) {
    return (
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 light:from-slate-50 light:via-slate-100 light:to-slate-50">
          <div className="container mx-auto p-6">
            <DashboardHeader
              title="Manager"
              description="Gerenciamento de Business Managers"
            />

            <Card className="bg-slate-900/50 dark:bg-slate-900/50 light:bg-white border-slate-800 dark:border-slate-800 light:border-slate-200 backdrop-blur-sm">
              <CardContent className="p-6">
                <BusinessManagersTab />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    );
  }

  return null;
};
