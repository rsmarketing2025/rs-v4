
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
    console.log('🔍 Fetching permissions for user:', user?.id);
    
    if (!user) {
      console.log('❌ No user found, setting empty permissions');
      setPermissions({ pages: [] });
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('📊 Querying user_page_permissions for user:', user.id);
      
      // Buscar apenas permissões de páginas
      const { data: pagePermissions, error: fetchError } = await supabase
        .from('user_page_permissions')
        .select('page, can_access')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('❌ Error fetching permissions:', fetchError);
        throw fetchError;
      }

      console.log('✅ Permissions fetched successfully:', pagePermissions);
      
      setPermissions({
        pages: pagePermissions || []
      });
    } catch (error) {
      console.error('❌ Error in fetchPermissions:', error);
      setError('Erro ao carregar permissões');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('🔄 usePermissions effect triggered, user changed:', user?.id);
    fetchPermissions();
  }, [fetchPermissions]);

  const canAccessPage = useCallback((page: string): boolean => {
    console.log('🔐 Checking access for page:', page);
    console.log('📋 Current permissions:', permissions.pages);
    
    const permission = permissions.pages.find(p => p.page === page);
    const hasAccess = permission ? permission.can_access : false;
    
    console.log(`🎯 Permission for ${page}:`, permission);
    console.log(`✅ Access result for ${page}:`, hasAccess);
    
    return hasAccess;
  }, [permissions.pages]);

  const canManageUsers = useCallback((): boolean => {
    return canAccessPage('users');
  }, [canAccessPage]);

  const canManageBusinessManagers = useCallback((): boolean => {
    return canAccessPage('business-managers');
  }, [canAccessPage]);

  const refreshPermissions = useCallback(() => {
    console.log('🔄 Refreshing permissions manually');
    setLoading(true);
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    canAccessPage,
    canManageUsers,
    canManageBusinessManagers,
    refreshPermissions,
    isAdmin // Manter compatibilidade durante transição
  };
};
