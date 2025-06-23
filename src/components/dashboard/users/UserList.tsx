
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserForm } from './UserForm';
import { DeleteUserDialog } from './DeleteUserDialog';
import { UserDetailModal } from './UserDetailModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Eye, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import type { UserWithPermissions } from './types';

export const UserList = () => {
  const [selectedUser, setSelectedUser] = useState<UserWithPermissions | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles (role),
          user_page_permissions (page, can_access)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data?.map(user => ({
        ...user,
        role: user.user_roles?.[0]?.role || 'user',
        permissions: user.user_page_permissions || []
      })) || [];
    },
  });

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: UserWithPermissions) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = (user: UserWithPermissions) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleViewDetails = (user: UserWithPermissions) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleFormClose = () => {
    setSelectedUser(null);
    setIsFormOpen(false);
    refetch();
  };

  const handleDeleteClose = () => {
    setSelectedUser(null);
    setIsDeleteDialogOpen(false);
    refetch();
  };

  const handleDetailClose = () => {
    setSelectedUser(null);
    setIsDetailModalOpen(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-600 hover:bg-red-700';
      case 'business_manager':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Carregando usuários...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-neutral-800 border-neutral-700">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-white">Gerenciamento de Usuários</CardTitle>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-neutral-700 border-neutral-600 text-white placeholder-slate-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300">Nome</TableHead>
                  <TableHead className="text-slate-300">Email</TableHead>
                  <TableHead className="text-slate-300">Função</TableHead>
                  <TableHead className="text-slate-300">Criado em</TableHead>
                  <TableHead className="text-slate-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-slate-700 hover:bg-slate-800/30">
                    <TableCell className="text-white">
                      <div>
                        <div className="font-medium">{user.full_name || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role === 'admin' && 'Administrador'}
                        {user.role === 'business_manager' && 'Gerente de Negócios'}
                        {user.role === 'user' && 'Usuário'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(user)}
                          className="text-slate-300 border-slate-600 hover:bg-slate-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="text-slate-300 border-slate-600 hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="text-red-400 border-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              {searchTerm ? 'Nenhum usuário encontrado com o termo de busca.' : 'Nenhum usuário encontrado.'}
            </div>
          )}
        </CardContent>
      </Card>

      <UserForm
        user={selectedUser}
        isOpen={isFormOpen}
        onClose={handleFormClose}
      />

      <DeleteUserDialog
        user={selectedUser}
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteClose}
      />

      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={handleDetailClose}
      />
    </div>
  );
};
