
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type UserPage = Database['public']['Enums']['user_page'];

interface User {
  id: string;
  email: string;
  full_name: string;
  status?: string;
  created_at: string;
  role: 'admin' | 'user' | 'gestor';
}

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  currentUserRole?: string | null;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdate,
  currentUserRole
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    status: '',
    role: 'user' as 'admin' | 'user' | 'gestor'
  });
  
  // Page permissions state
  const [pagePermissions, setPagePermissions] = useState({
    creatives: true,
    sales: true,
    affiliates: true,
    revenue: true,
    users: false,
  });
  
  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        status: user.status || 'active',
        role: user.role || 'user'
      });
      
      // Fetch user permissions
      fetchUserPermissions(user.id);
    }
  }, [user]);

  const fetchUserPermissions = async (userId: string) => {
    try {
      console.log('Fetching permissions for user:', userId);
      
      // Fetch page permissions
      const { data: pagePermsData, error: pagePermsError } = await supabase
        .from('user_page_permissions')
        .select('page, can_access')
        .eq('user_id', userId);

      if (pagePermsError) {
        console.error('Error fetching page permissions:', pagePermsError);
        throw pagePermsError;
      }

      console.log('Page permissions data:', pagePermsData);

      if (pagePermsData && pagePermsData.length > 0) {
        const permissions = {
          creatives: pagePermsData.find(p => p.page === 'creatives')?.can_access ?? true,
          sales: pagePermsData.find(p => p.page === 'sales')?.can_access ?? true,
          affiliates: pagePermsData.find(p => p.page === 'affiliates')?.can_access ?? true,
          revenue: pagePermsData.find(p => p.page === 'revenue')?.can_access ?? true,
          users: pagePermsData.find(p => p.page === 'users')?.can_access ?? false,
        };
        console.log('Setting page permissions:', permissions);
        setPagePermissions(permissions);
      } else {
        // Set default permissions if none exist
        console.log('No existing page permissions found, using defaults');
        setPagePermissions({
          creatives: true,
          sales: true,
          affiliates: true,
          revenue: true,
          users: false,
        });
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as permissões do usuário.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('Updating user:', user.id);
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw profileError;
      }

      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: formData.role })
        .eq('user_id', user.id);

      if (roleError) {
        console.error('Error updating role:', roleError);
        throw roleError;
      }

      console.log('Updating page permissions:', pagePermissions);
      
      // Delete existing page permissions first
      const { error: deletePageError } = await supabase
        .from('user_page_permissions')
        .delete()
        .eq('user_id', user.id);

      if (deletePageError) {
        console.error('Error deleting existing page permissions:', deletePageError);
        throw deletePageError;
      }

      // Insert new page permissions
      const pagePermissionsToInsert = Object.entries(pagePermissions).map(([page, canAccess]) => ({
        user_id: user.id,
        page: page as UserPage,
        can_access: canAccess
      }));

      console.log('Inserting page permissions:', pagePermissionsToInsert);

      const { error: pagePermError } = await supabase
        .from('user_page_permissions')
        .insert(pagePermissionsToInsert);

      if (pagePermError) {
        console.error('Error inserting page permissions:', pagePermError);
        throw pagePermError;
      }

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso.",
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Sending password update request...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const supabaseUrl = 'https://cnhjnfwkjakvxamefzzg.supabase.co';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/update-user-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          newPassword: passwordData.newPassword,
        }),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to update password');
      }

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso.",
      });

      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Erro",
        description: `Não foi possível alterar a senha: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePagePermissionChange = (page: string, checked: boolean) => {
    console.log(`Changing page permission for ${page} to ${checked}`);
    setPagePermissions(prev => ({
      ...prev,
      [page]: checked
    }));
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
          <DialogDescription>
            Visualize e edite as informações do usuário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Informações Básicas</h4>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Nome
              </Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="col-span-3 bg-muted"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Função
              </Label>
              <Select value={formData.role} onValueChange={(value: 'admin' | 'user' | 'gestor') => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Criado em</Label>
              <div className="col-span-3">
                <Badge variant="outline">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Page Permissions */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Permissões de Acesso às Páginas</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(pagePermissions).map(([page, canAccess]) => (
                <div key={page} className="flex items-center space-x-2">
                  <Checkbox
                    id={page}
                    checked={canAccess}
                    onCheckedChange={(checked) => handlePagePermissionChange(page, checked as boolean)}
                    className="border-slate-600"
                  />
                  <Label htmlFor={page} className="text-white capitalize cursor-pointer">
                    {page === 'creatives' && 'Criativos'}
                    {page === 'sales' && 'Vendas'}
                    {page === 'affiliates' && 'Afiliados'}
                    {page === 'revenue' && 'Receita'}
                    {page === 'users' && 'Usuários'}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Password Change Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Alterar Senha</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordChange(!showPasswordChange)}
              >
                {showPasswordChange ? 'Cancelar' : 'Alterar Senha'}
              </Button>
            </div>

            {showPasswordChange && (
              <div className="space-y-3 border rounded-lg p-4 bg-muted/50">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="newPassword" className="text-right text-sm">
                    Nova Senha
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="col-span-3"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="confirmPassword" className="text-right text-sm">
                    Confirmar
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="col-span-3"
                    placeholder="Confirme a nova senha"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handlePasswordChange}
                    disabled={isLoading || !passwordData.newPassword || !passwordData.confirmPassword}
                    size="sm"
                  >
                    {isLoading ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
