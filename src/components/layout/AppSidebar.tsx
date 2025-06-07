
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
      <Sidebar className="border-r border-sidebar-border bg-sidebar">
        <SidebarHeader className="p-6 bg-sidebar-accent flex items-center justify-center border-b border-sidebar-border">
          <img 
            src="https://recuperacaoexponencial.com.br/wp-content/uploads/2025/06/ChatGPT-Image-31-de-mai.-de-2025-23_39_35.png" 
            alt="Logo da Empresa" 
            className="h-32 w-auto max-w-[70%] object-contain"
          />
        </SidebarHeader>
        <SidebarContent className="bg-sidebar">
          <div className="p-4 text-sidebar-foreground/70 text-center">
            Carregando permissões...
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-6 bg-sidebar-accent flex items-center justify-center border-b border-sidebar-border">
        <img 
          src="https://recuperacaoexponencial.com.br/wp-content/uploads/2025/06/ChatGPT-Image-31-de-mai.-de-2025-23_39_35.png" 
          alt="Logo da Empresa" 
          className="h-32 w-auto max-w-[70%] object-contain"
        />
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                    className="text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground"
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
      <SidebarFooter className="p-4 bg-sidebar-accent border-t border-sidebar-border">
        <div className="text-sm text-sidebar-foreground/70 mb-2">
          {user?.email}
        </div>
        <Button
          onClick={signOut}
          variant="outline"
          size="sm"
          className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
