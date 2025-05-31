
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, User, Mail, Phone, Shield, ShieldCheck, Edit, Trash2 } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  username: string | null;
  phone: string | null;
  created_at: string;
  status: string | null;
  role: 'admin' | 'user';
  pagePermissions: {
    creatives: boolean;
    sales: boolean;
    affiliates: boolean;
  };
}

interface UserListProps {
  refreshTrigger: number;
}

export const UserList: React.FC<UserListProps> = ({ refreshTrigger }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles with roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          username,
          phone,
          created_at,
          status
        `);

      if (profilesError) throw profilesError;

      if (!profilesData) return;

      // Fetch roles for each user
      const userIds = profilesData.map(profile => profile.id);
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Fetch page permissions for each user
      const { data: pagePermissionsData, error: pagePermissionsError } = await supabase
        .from('user_page_permissions')
        .select('user_id, page, can_access')
        .in('user_id', userIds);

      if (pagePermissionsError) throw pagePermissionsError;

      // Combine all data
      const usersWithDetails = profilesData.map(profile => {
        const userRole = rolesData?.find(role => role.user_id === profile.id);
        const userPagePermissions = pagePermissionsData?.filter(perm => perm.user_id === profile.id) || [];
        
        const pagePermissions = {
          creatives: userPagePermissions.find(p => p.page === 'creatives')?.can_access ?? true,
          sales: userPagePermissions.find(p => p.page === 'sales')?.can_access ?? true,
          affiliates: userPagePermissions.find(p => p.page === 'affiliates')?.can_access ?? true,
        };

        return {
          ...profile,
          role: userRole?.role || 'user',
          pagePermissions
        };
      });

      setUsers(usersWithDetails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja remover o usuário ${userName}?`)) {
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;

      toast({
        title: "Usuário removido",
        description: `${userName} foi removido do sistema.`,
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro ao remover usuário",
        description: error.message || "Ocorreu um erro ao remover o usuário.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPermissionsBadges = (permissions: UserProfile['pagePermissions']) => {
    return Object.entries(permissions)
      .filter(([_, hasAccess]) => hasAccess)
      .map(([page, _]) => (
        <Badge 
          key={page} 
          variant="secondary" 
          className="bg-blue-600/20 text-blue-300 text-xs"
        >
          {page === 'creatives' ? 'Criativos' : 
           page === 'sales' ? 'Vendas' : 'Afiliados'}
        </Badge>
      ));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar usuários..."
            className="pl-10 bg-slate-900/50 border-slate-600 text-white"
            disabled
          />
        </div>
        <div className="text-center text-slate-400 py-8">
          Carregando usuários...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar usuários por nome, email ou username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-900/50 border-slate-600 text-white"
        />
      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            {searchTerm ? "Nenhum usuário encontrado." : "Nenhum usuário cadastrado."}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-slate-700 p-3 rounded-full">
                      <User className="w-6 h-6 text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium">{user.full_name}</h3>
                      {user.username && (
                        <p className="text-slate-400 text-sm">@{user.username}</p>
                      )}
                      
                      <div className="flex items-center space-x-2 text-slate-400 text-sm mt-1">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                      
                      {user.phone && (
                        <div className="flex items-center space-x-2 text-slate-400 text-sm mt-1">
                          <Phone className="w-3 h-3" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      
                      <div className="text-slate-500 text-xs mt-2">
                        Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </div>

                      {/* Permissions */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {getPermissionsBadges(user.pagePermissions)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Role Badge */}
                    <Badge 
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                      className={user.role === 'admin' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-600 text-slate-200'
                      }
                    >
                      {user.role === 'admin' ? (
                        <>
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <Shield className="w-3 h-3 mr-1" />
                          Usuário
                        </>
                      )}
                    </Badge>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300 hover:bg-slate-800"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id, user.full_name)}
                        className="border-red-600 text-red-400 hover:bg-red-600/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
