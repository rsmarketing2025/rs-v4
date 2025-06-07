
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
import { BarChart3, Users, LogOut, Settings } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

const allMenuItems = [
  {
    title: "Performance",
    url: "/dashboard",
    icon: BarChart3,
    page: null, // Sempre visível
  },
  {
    title: "Business Managers",
    url: "/business-managers",
    icon: Settings,
    requireAdmin: true,
    page: null, // Controlado por requireAdmin
  },
  {
    title: "Usuários",
    url: "/users",
    icon: Users,
    page: "users" as const,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { hasPageAccess, loading } = usePermissions();

  // Filtrar itens do menu baseado nas permissões
  const filteredMenuItems = allMenuItems.filter(item => {
    // Se tem requireAdmin, verificar se é admin
    if (item.requireAdmin && !isAdmin) {
      return false;
    }
    
    // Se tem page definida, verificar permissão da página
    if (item.page && !loading && !hasPageAccess(item.page)) {
      return false;
    }
    
    return true;
  });

  return (
    <Sidebar className="bg-blue-950 border-blue-800">
      <SidebarHeader className="p-6 bg-blue-900 flex items-center justify-center">
        <img 
          src="https://recuperacaoexponencial.com.br/wp-content/uploads/2025/06/ChatGPT-Image-31-de-mai.-de-2025-23_39_35.png" 
          alt="Logo da Empresa" 
          className="h-32 w-auto max-w-[70%] object-contain"
        />
      </SidebarHeader>
      <SidebarContent className="bg-blue-950">
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-200">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                <SidebarMenuItem>
                  <div className="text-blue-200 p-2">Carregando menu...</div>
                </SidebarMenuItem>
              ) : (
                filteredMenuItems.map((item) => (
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
                ))
              )}
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
