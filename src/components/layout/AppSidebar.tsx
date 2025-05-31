
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BarChart3 } from "lucide-react";
import { useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Performance",
    url: "/dashboard",
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="bg-blue-950 border-blue-800">
      <SidebarHeader className="p-6 bg-blue-900">
        <h2 className="text-lg font-semibold text-white">DW Marketing</h2>
        <p className="text-sm text-blue-200">Manager</p>
      </SidebarHeader>
      <SidebarContent className="bg-blue-950">
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-200">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="text-blue-100 hover:text-white hover:bg-blue-800 data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                  >
                    <a href={item.url}>
                      <item.icon />
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
