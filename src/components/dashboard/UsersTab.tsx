
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { UserForm } from './users/UserForm';
import { UserList } from './users/UserList';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const UsersTab: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { session } = useAuth();

  // Verificar permissões do usuário atual
  React.useEffect(() => {
    const checkUserRole = async () => {
      if (session?.user?.id) {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        setUserRole(data?.role || null);
      }
    };

    checkUserRole();
  }, [session]);

  const handleUserCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowCreateForm(false);
  };

  // Verificar se o usuário tem permissão para criar usuários
  const canCreateUsers = userRole === 'admin' || userRole === 'gestor';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciamento de Usuários</h2>
          <p className="text-slate-400">
            Gerencie usuários do sistema com controle de permissões por papel (admin, gestor, usuário)
          </p>
        </div>
        {canCreateUsers && (
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-neutral-900 hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        )}
      </div>

      {/* Create User Form */}
      {showCreateForm && canCreateUsers && (
        <UserForm 
          onClose={() => setShowCreateForm(false)}
          onUserCreated={handleUserCreated}
          currentUserRole={userRole}
        />
      )}

      {/* Users List */}
      <UserList 
        refreshTrigger={refreshTrigger} 
        currentUserRole={userRole}
        onUserUpdated={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
};
