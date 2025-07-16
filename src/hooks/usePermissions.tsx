
import { useState, useEffect, useCallback } from 'react';
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
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    if (!user) {
      setPermissions({ pages: [] });
      setLoading(false);
      return;
    }

    try {
      setError(null);
      // Buscar apenas permissões de páginas
      const { data: pagePermissions, error: fetchError } = await supabase
        .from('user_page_permissions')
        .select('page, can_access')
        .eq('user_id', user.id);

      if (fetchError) {
        throw fetchError;
      }

      setPermissions({
        pages: pagePermissions || []
      });
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setError('Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const canAccessPage = useCallback((page: string): boolean => {
    // Admins têm acesso total
    if (isAdmin) return true;
    
    const permission = permissions.pages.find(p => p.page === page);
    return permission ? permission.can_access : false;
  }, [isAdmin, permissions.pages]);

  const refreshPermissions = useCallback(() => {
    setLoading(true);
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    canAccessPage,
    refreshPermissions
  };
};
