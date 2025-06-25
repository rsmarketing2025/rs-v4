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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, LogOut, Settings, Bot } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  {
    title: "Performance",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Agente de IA - Copy",
    url: "/ai-agents",
    icon: Bot,
  },
  {
    title: "Business Managers",
    url: "/business-managers",
    icon: Settings,
    requireAdmin: true,
  },
  {
    title: "Usuários",
    url: "/users",
    icon: Users,
    requireAdmin: true,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    !item.requireAdmin || isAdmin
  );

  return (
    <Sidebar className="bg-neutral-950 border-neutral-800">
      <SidebarHeader className="p-6 bg-neutral-900 flex items-center justify-center">
        <img 
          src="/lovable-uploads/7d2bb631-1daa-4855-9350-e0d2e5a31475.png" 
          alt="Logo da Empresa" 
          className="h-32 w-auto max-w-[70%] object-contain"
        />
      </SidebarHeader>
      <SidebarContent className="bg-neutral-950">
        <SidebarGroup>
          <SidebarGroupLabel className="text-neutral-200">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="text-neutral-100 hover:text-white hover:bg-neutral-800 data-[state=active]:bg-neutral-700 data-[state=active]:text-white"
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
      <SidebarFooter className="p-4 bg-neutral-900">
        <div className="text-sm text-neutral-200 mb-2">
          {user?.email}
        </div>
        <Button
          onClick={signOut}
          variant="outline"
          size="sm"
          className="w-full border-neutral-600 text-neutral-200 hover:bg-neutral-800"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
