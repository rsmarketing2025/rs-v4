
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, LogOut, Settings, Bot } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

const menuItems = [{
  title: "Performance",
  url: "/dashboard",
  icon: BarChart3,
  permissionPage: "creatives" // Página principal do dashboard
}, {
  title: "Agente de IA - Copy",
  url: "/ai-agents",
  icon: Bot
}, {
  title: "Business Managers",
  url: "/business-managers",
  icon: Settings,
  permissionPage: "business-managers"
}, {
  title: "Usuários",
  url: "/users",
  icon: Users,
  permissionPage: "users"
}];

export function AppSidebar() {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { canAccessPage, loading } = usePermissions();
  
  // Filtrar itens baseado nas permissões
  const filteredMenuItems = menuItems.filter(item => {
    // Se não tem página de permissão definida, sempre mostrar
    if (!item.permissionPage) return true;
    
    // Se é admin, sempre mostrar
    if (isAdmin) return true;
    
    // Verificar permissão específica da página
    return canAccessPage(item.permissionPage);
  });
  
  // Mostrar skeleton enquanto carrega permissões
  if (loading) {
    return (
      <Sidebar className="bg-slate-950 border-slate-800">
        <SidebarHeader className="p-6 bg-slate-900 flex items-center justify-center">
          <img src="/lovable-uploads/7d2bb631-1daa-4855-9350-e0d2e5a31475.png" alt="Logo da Empresa" className="h-32 w-auto max-w-[70%] object-contain" />
        </SidebarHeader>
        <SidebarContent className="bg-slate-900">
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-100">Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 p-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 bg-slate-900">
          <div className="text-sm text-slate-100 mb-2">
            {user?.email}
          </div>
          <Button onClick={signOut} variant="outline" size="sm" className="w-full border-slate-600 text-slate-100 hover:bg-slate-800">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="bg-slate-950 border-slate-800">
      <SidebarHeader className="p-6 bg-slate-900 flex items-center justify-center">
        <img src="/lovable-uploads/7d2bb631-1daa-4855-9350-e0d2e5a31475.png" alt="Logo da Empresa" className="h-32 w-auto max-w-[70%] object-contain" />
      </SidebarHeader>
      <SidebarContent className="bg-slate-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-100">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url} 
                    className="text-slate-100 hover:text-white hover:bg-slate-800 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
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
      <SidebarFooter className="p-4 bg-slate-900">
        <div className="text-sm text-slate-100 mb-2">
          {user?.email}
        </div>
        <Button onClick={signOut} variant="outline" size="sm" className="w-full border-slate-600 text-slate-100 hover:bg-slate-800">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
