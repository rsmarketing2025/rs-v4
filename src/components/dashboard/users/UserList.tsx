
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, User, Mail, Phone, Shield, ShieldCheck, Edit, Trash2, Crown } from 'lucide-react';
import { UserDetailModal } from './UserDetailModal';
import { DeleteUserDialog } from './DeleteUserDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  username: string | null;
  status?: string;
  created_at: string;
  role: 'admin' | 'user' | 'gestor';
  pagePermissions: {
    creatives: boolean;
    sales: boolean;
    affiliates: boolean;
    revenue: boolean;
    users: boolean;
  };
}

interface User {
  id: string;
  full_name: string;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'business_manager';
  permissions: {
    creatives: boolean;
    sales: boolean;
    affiliates: boolean;
    revenue: boolean;
    users: boolean;
    'business-managers': boolean;
    subscriptions: boolean;
  };
}

interface UserListProps {
  refreshTrigger: number;
  currentUserRole: string | null;
  onUserUpdated: () => void;
}

export const UserList: React.FC<UserListProps> = ({ 
  refreshTrigger, 
  currentUserRole,
  onUserUpdated 
}) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar perfis
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          username,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;
      if (!profilesData) return;

      // Buscar roles para cada usuário
      const userIds = profilesData.map(profile => profile.id);
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Buscar permissões de página para cada usuário
      const { data: pagePermissionsData, error: pagePermissionsError } = await supabase
        .from('user_page_permissions')
        .select('user_id, page, can_access')
        .in('user_id', userIds);

      if (pagePermissionsError) throw pagePermissionsError;

      // Combinar todos os dados
      const usersWithDetails = profilesData.map(profile => {
        const userRole = rolesData?.find(role => role.user_id === profile.id);
        const userPagePermissions = pagePermissionsData?.filter(perm => perm.user_id === profile.id) || [];
        
        // Construir objeto de permissões de página
        const pagePermissions = {
          creatives: userPagePermissions.find(p => p.page === 'creatives')?.can_access ?? true,
          sales: userPagePermissions.find(p => p.page === 'sales')?.can_access ?? true,
          affiliates: userPagePermissions.find(p => p.page === 'affiliates')?.can_access ?? true,
          revenue: userPagePermissions.find(p => p.page === 'revenue')?.can_access ?? true,
          users: userPagePermissions.find(p => p.page === 'users')?.can_access ?? false,
        };

        return {
          id: profile.id,
          full_name: profile.full_name || '',
          email: profile.email || '',
          username: profile.username,
          status: 'active', // Default status since it's not in the profiles table
          created_at: profile.created_at,
          role: (userRole?.role as 'admin' | 'user' | 'gestor') || 'user',
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

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeletingUser(true);

      // Chamar a Edge Function para deletar o usuário
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: userToDelete.id }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Usuário removido",
        description: `${userToDelete.name} foi removido do sistema com sucesso.`,
      });

      // Fechar o dialog e recarregar a lista
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro ao remover usuário",
        description: error.message || "Ocorreu um erro ao remover o usuário.",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge className="bg-red-600 text-white">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case 'gestor':
        return (
          <Badge className="bg-blue-600 text-white">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Gestor
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-slate-600 text-slate-200">
            <Shield className="w-3 h-3 mr-1" />
            Usuário
          </Badge>
        );
    }
  };

  const canEditUser = (targetUser: UserProfile) => {
    if (currentUserRole === 'admin') return true;
    if (currentUserRole === 'gestor') {
      return targetUser.role === 'user'; // Gestores só podem editar usuários comuns
    }
    return false;
  };

  const canDeleteUser = (targetUser: UserProfile) => {
    return currentUserRole === 'admin'; // Apenas admins podem deletar
  };

  const convertToModalUser = (user: UserProfile): User => {
    return {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      username: user.username || '',
      role: user.role === 'gestor' ? 'business_manager' : user.role,
      permissions: {
        creatives: user.pagePermissions.creatives,
        sales: user.pagePermissions.sales,
        affiliates: user.pagePermissions.affiliates,
        revenue: user.pagePermissions.revenue,
        users: user.pagePermissions.users,
        'business-managers': true,
        subscriptions: true
      }
    };
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          placeholder="Buscar por nome, email ou username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-900/50 border-slate-600 text-white"
        />
      </div>

      {/* Users Table */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader sticky={true}>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Nome</TableHead>
                  <TableHead className="text-slate-300">Email</TableHead>
                  <TableHead className="text-slate-300">Username</TableHead>
                  <TableHead className="text-slate-300">Papel</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Criado em</TableHead>
                  <TableHead className="text-slate-300 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                      {searchTerm ? "Nenhum usuário encontrado." : "Nenhum usuário cadastrado."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-slate-700 hover:bg-slate-800/30">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="bg-slate-700 p-2 rounded-full">
                            <User className="w-4 h-4 text-slate-300" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.full_name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">{user.email}</TableCell>
                      <TableCell className="text-slate-300">{user.username || '-'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                          className={user.status === 'active' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-slate-600 text-slate-200'
                          }
                        >
                          {user.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(convertToModalUser(user))}
                            className="border-slate-600 text-slate-300 hover:bg-slate-800"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          {canDeleteUser(user) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setUserToDelete({ id: user.id, name: user.full_name })}
                              className="border-red-600 text-red-400 hover:bg-red-600/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          isOpen={!!selectedUser}
          currentUserRole={currentUserRole}
          onClose={() => setSelectedUser(null)}
          onUserUpdated={onUserUpdated}
          onUpdate={() => {
            onUserUpdated();
            setSelectedUser(null);
          }}
        />
      )}

      {/* Delete User Dialog */}
      <DeleteUserDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        userName={userToDelete?.name || ''}
        loading={deletingUser}
      />
    </div>
  );
};
