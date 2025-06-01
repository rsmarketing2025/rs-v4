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
import { BarChart3, Users, LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  {
    title: "Performance",
    url: "/dashboard",
    icon: BarChart3,
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
    <Sidebar className="bg-blue-950 border-blue-800">
      <SidebarHeader className="p-6 bg-blue-900 flex items-center justify-center">
        <img 
          src="https://recuperacaoexponencial.com.br/wp-content/uploads/2025/06/ChatGPT-Image-31-de-mai.-de-2025-23_21_38.png" 
          alt="Logo da Empresa" 
          className="h-32 w-auto max-w-[70%] object-contain"
        />
      </SidebarHeader>
      <SidebarContent className="bg-blue-950">
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-200">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
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
      <SidebarFooter className="p-4 bg-blue-900">
        <div className="text-sm text-blue-200 mb-2">
          {user?.email}
        </div>
        <Button
          onClick={signOut}
          variant="outline"
          size="sm"
          className="w-full border-blue-600 text-blue-200 hover:bg-blue-800"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
