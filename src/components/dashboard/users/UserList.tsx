
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { UserForm } from "./UserForm";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { UserDetailModal } from "./UserDetailModal";
import { UserWithPermissions } from './types';
import { useToast } from "@/hooks/use-toast";

interface UserListProps {
  refreshTrigger?: number;
  currentUserRole?: string;
  onUserUpdated?: () => void;
}

export const UserList: React.FC<UserListProps> = ({ 
  refreshTrigger = 0, 
  currentUserRole = 'user',
  onUserUpdated 
}) => {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  console.log('🎯 UserList render - currentUserRole:', currentUserRole);

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, username, avatar_url, created_at, updated_at');

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast({
          title: "Erro ao buscar usuários",
          description: "Ocorreu um erro ao carregar a lista de usuários.",
          variant: "destructive",
        });
        return;
      }

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        toast({
          title: "Erro ao buscar funções dos usuários",
          description: "Ocorreu um erro ao carregar as funções dos usuários.",
          variant: "destructive",
        });
        return;
      }

      const { data: permissions, error: permissionsError } = await supabase
        .from('user_page_permissions')
        .select('user_id, page, can_access');

      if (permissionsError) {
        console.error("Error fetching user permissions:", permissionsError);
        toast({
          title: "Erro ao buscar permissões dos usuários",
          description: "Ocorreu um erro ao carregar as permissões dos usuários.",
          variant: "destructive",
        });
        return;
      }

      const usersWithRoles = profiles.map(profile => {
        const role = roles.find(r => r.user_id === profile.id)?.role || 'user';
        const userPermissions = permissions
          .filter(p => p.user_id === profile.id)
          .map(p => ({ page: p.page, can_access: p.can_access }));

        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          username: profile.username,
          avatar_url: profile.avatar_url,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          role: role,
          permissions: userPermissions,
          user_page_permissions: userPermissions
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Unexpected error fetching users:", error);
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro inesperado ao carregar os dados dos usuários.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = () => {
    fetchUsers();
    if (onUserUpdated) {
      onUserUpdated();
    }
  };

  const handleEditUser = (user: UserWithPermissions) => {
    console.log('✏️ Editando usuário:', user);
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (user.full_name && user.full_name.toLowerCase().includes(searchTermLower)) ||
      (user.email && user.email.toLowerCase().includes(searchTermLower))
    );
  });

  const isAdmin = currentUserRole === 'admin';
  console.log('🔐 Is admin check:', isAdmin, 'Role:', currentUserRole);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Input
          type="search"
          placeholder="Buscar usuário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md bg-neutral-700 text-white placeholder:text-slate-400 border-neutral-600 focus-visible:ring-neutral-500"
        />
        {isAdmin && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-sky-500 hover:bg-sky-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Usuário
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-slate-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700 hover:bg-slate-800/50">
              <TableHead className="text-slate-300">Nome</TableHead>
              <TableHead className="text-slate-300">Email</TableHead>
              <TableHead className="text-slate-300">Função</TableHead>
              <TableHead className="text-slate-300">Criado em</TableHead>
              <TableHead className="text-slate-300 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow className="border-slate-700">
                <TableCell colSpan={5} className="text-center text-slate-400 py-8">
                  {searchTerm ? 'Nenhum usuário encontrado com esse critério' : 'Nenhum usuário encontrado'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-slate-700 hover:bg-slate-800/30">
                  <TableCell className="text-white">
                    {user.full_name || 'N/A'}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {user.email || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-sky-500 hover:bg-sky-600">
                      {user.role === 'admin' ? 'Administrador' : 
                       user.role === 'business_manager' ? 'Gestor de Negócios' : 'Usuário'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {new Date(user.created_at || '').toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDetailModalOpen(true);
                        }}
                        className="text-slate-300 border-slate-600 hover:bg-slate-700"
                        title="Visualizar detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="text-blue-400 border-blue-600 hover:bg-blue-600/20"
                            title="Editar usuário"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-400 border-red-600 hover:bg-red-600/20"
                            title="Excluir usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <UserForm
        user={selectedUser}
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedUser(undefined);
        }}
        onUserUpdate={handleUserUpdate}
      />

      <DeleteUserDialog
        user={selectedUser}
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedUser(undefined);
        }}
        onUserUpdate={handleUserUpdate}
      />

      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUser(undefined);
        }}
      />
    </div>
  );
};
