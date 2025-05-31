
import { BarChart3, TrendingUp } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Performance",
    url: "/dashboard",
    icon: BarChart3,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="bg-slate-900 border-slate-800">
      <SidebarHeader className="p-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <span className="text-lg font-bold text-white">DW Marketing</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-400">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="text-slate-300 hover:bg-slate-800 hover:text-white">
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
