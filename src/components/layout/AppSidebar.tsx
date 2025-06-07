
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

const menuItems = [
  {
    title: "Performance",
    url: "/dashboard",
    icon: BarChart3,
    requiredPage: "creatives" as const,
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
    requiredPage: "users" as const,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { hasPageAccess, loading: permissionsLoading } = usePermissions();

  console.log('AppSidebar state:', {
    user: user?.email,
    isAdmin,
    permissionsLoading,
    currentPath: location.pathname
  });

  const filteredMenuItems = menuItems.filter(item => {
    console.log('Checking menu item:', item.title);
    
    // Check admin requirement first
    if (item.requireAdmin) {
      console.log(`Item ${item.title} requires admin. User is admin:`, isAdmin);
      if (!isAdmin) {
        return false;
      }
    }
    
    // Check page permission
    if (item.requiredPage) {
      const hasAccess = hasPageAccess(item.requiredPage);
      console.log(`Item ${item.title} requires page ${item.requiredPage}. Has access:`, hasAccess);
      if (!hasAccess) {
        return false;
      }
    }
    
    console.log(`Item ${item.title} is accessible`);
    return true;
  });

  console.log('Filtered menu items:', filteredMenuItems.map(item => item.title));

  if (permissionsLoading) {
    return (
      <Sidebar className="border-r bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900">
        <SidebarHeader className="p-6 bg-blue-600 flex items-center justify-center border-b border-blue-500">
          <img 
            src="https://recuperacaoexponencial.com.br/wp-content/uploads/2025/06/ChatGPT-Image-31-de-mai.-de-2025-23_39_35.png" 
            alt="Logo da Empresa" 
            className="h-32 w-auto max-w-[70%] object-contain"
          />
        </SidebarHeader>
        <SidebarContent className="bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900">
          <div className="p-4 text-white/70 text-center">
            Carregando permissões...
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900">
      <SidebarHeader className="p-6 bg-blue-600 flex items-center justify-center border-b border-blue-500">
        <img 
          src="https://recuperacaoexponencial.com.br/wp-content/uploads/2025/06/ChatGPT-Image-31-de-mai.-de-2025-23_39_35.png" 
          alt="Logo da Empresa" 
          className="h-32 w-auto max-w-[70%] object-contain"
        />
      </SidebarHeader>
      <SidebarContent className="bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/80 px-4 py-3 text-sm uppercase tracking-wider font-medium">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="text-white/90 hover:text-white hover:bg-white/10 data-[state=active]:bg-white/15 data-[state=active]:text-white mx-2 rounded-lg transition-all duration-200"
                  >
                    <a href={item.url} className="flex items-center gap-3 px-4 py-3">
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-gradient-to-t from-blue-900 to-blue-800 border-t border-blue-600">
        <div className="text-sm text-white/90 mb-3 px-2 truncate">
          {user?.email}
        </div>
        <Button
          onClick={signOut}
          variant="outline"
          size="sm"
          className="w-full border-white/30 text-white hover:bg-white/15 hover:text-white hover:border-white/50 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
