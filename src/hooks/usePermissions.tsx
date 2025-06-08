
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PagePermission {
  page: string;
  can_access: boolean;
}

interface Permissions {
  pages: PagePermission[];
}

export const usePermissions = () => {
  const { user, isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<Permissions>({
    pages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Buscar apenas permissões de páginas
        const { data: pagePermissions } = await supabase
          .from('user_page_permissions')
          .select('page, can_access')
          .eq('user_id', user.id);

        setPermissions({
          pages: pagePermissions || []
        });
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  const canAccessPage = (page: string): boolean => {
    // Admins têm acesso total
    if (isAdmin) return true;
    
    const permission = permissions.pages.find(p => p.page === page);
    return permission ? permission.can_access : false;
  };

  return {
    permissions,
    loading,
    canAccessPage
  };
};
