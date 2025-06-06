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
import { ChartPermissions } from './ChartPermissions';
import { Database } from "@/integrations/supabase/types";

type UserPage = Database['public']['Enums']['user_page'];
type ChartType = Database['public']['Enums']['chart_type'];

interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  status: string;
  created_at: string;
  role: 'admin' | 'user' | 'gestor';
}

interface ChartPermission {
  chartType: string;
  page: string;
  canView: boolean;
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
    phone: '',
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

  // Chart permissions state
  const [chartPermissions, setChartPermissions] = useState<ChartPermission[]>([]);
  
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
        phone: user.phone || '',
        status: user.status || '',
        role: user.role || 'user'
      });
      
      // Fetch user permissions
      fetchUserPermissions(user.id);
    }
  }, [user]);

  const fetchUserPermissions = async (userId: string) => {
    try {
      // Fetch page permissions
      const { data: pagePermsData, error: pagePermsError } = await supabase
        .from('user_page_permissions')
        .select('page, can_access')
        .eq('user_id', userId);

      if (pagePermsError) throw pagePermsError;

      if (pagePermsData) {
        const permissions = {
          creatives: pagePermsData.find(p => p.page === 'creatives')?.can_access ?? true,
          sales: pagePermsData.find(p => p.page === 'sales')?.can_access ?? true,
          affiliates: pagePermsData.find(p => p.page === 'affiliates')?.can_access ?? true,
          revenue: pagePermsData.find(p => p.page === 'revenue')?.can_access ?? true,
          users: pagePermsData.find(p => p.page === 'users')?.can_access ?? false,
        };
        setPagePermissions(permissions);
      }

      // Fetch chart permissions
      const { data: chartPermsData, error: chartPermsError } = await supabase
        .from('user_chart_permissions')
        .select('chart_type, page, can_view')
        .eq('user_id', userId);

      if (chartPermsError) throw chartPermsError;

      if (chartPermsData) {
        const chartPerms = chartPermsData.map(p => ({
          chartType: p.chart_type,
          page: p.page,
          canView: p.can_view
        }));
        setChartPermissions(chartPerms);
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          status: formData.status
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: formData.role })
        .eq('user_id', user.id);

      if (roleError) throw roleError;

      // Update page permissions
      for (const [page, canAccess] of Object.entries(pagePermissions)) {
        const { error: pagePermError } = await supabase
          .from('user_page_permissions')
          .upsert({
            user_id: user.id,
            page: page as UserPage,
            can_access: canAccess
          }, {
            onConflict: 'user_id,page'
          });

        if (pagePermError) throw pagePermError;
      }

      // Update chart permissions
      if (chartPermissions.length > 0) {
        // Delete existing chart permissions
        const { error: deleteError } = await supabase
          .from('user_chart_permissions')
          .delete()
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Insert new chart permissions
        const chartPermsToInsert = chartPermissions.map(perm => ({
          user_id: user.id,
          chart_type: perm.chartType as ChartType,
          page: perm.page as UserPage,
          can_view: perm.canView
        }));

        const { error: chartPermError } = await supabase
          .from('user_chart_permissions')
          .insert(chartPermsToInsert);

        if (chartPermError) throw chartPermError;
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

      // Use the hardcoded Supabase URL instead of accessing protected property
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
    setPagePermissions(prev => ({
      ...prev,
      [page]: checked
    }));
  };

  const handleChartPermissionChange = (chartType: string, page: string, canView: boolean) => {
    setChartPermissions(prev => {
      const existingIndex = prev.findIndex(p => p.chartType === chartType && p.page === page);
      
      if (existingIndex >= 0) {
        // Update existing permission
        const updated = [...prev];
        updated[existingIndex] = { chartType, page, canView };
        return updated;
      } else {
        // Add new permission
        return [...prev, { chartType, page, canView }];
      }
    });
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
              <Label htmlFor="phone" className="text-right">
                Telefone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="col-span-3"
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

          {/* Chart Permissions */}
          <ChartPermissions
            chartPermissions={chartPermissions}
            onPermissionChange={handleChartPermissionChange}
          />

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
