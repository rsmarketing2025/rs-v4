
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Crown, ShieldCheck, Shield, Key } from 'lucide-react';
import { ChartPermissions } from './ChartPermissions';

interface ChartPermission {
  chartType: string;
  page: string;
  canView: boolean;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  username: string | null;
  phone: string | null;
  status: string;
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

interface UserDetailModalProps {
  user: UserProfile;
  currentUserRole: string | null;
  onClose: () => void;
  onUserUpdated: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  currentUserRole,
  onClose,
  onUserUpdated
}) => {
  const [formData, setFormData] = useState({
    fullName: user.full_name,
    username: user.username || '',
    phone: user.phone || '',
    status: user.status,
    role: user.role,
    pagePermissions: user.pagePermissions,
    chartPermissions: [] as ChartPermission[]
  });
  
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Verificar se o usuário atual pode editar este usuário
  const canEdit = () => {
    if (currentUserRole === 'admin') return true;
    if (currentUserRole === 'gestor' && user.role === 'user') return true;
    return false;
  };

  // Verificar se pode alterar o papel
  const canChangeRole = () => {
    return currentUserRole === 'admin';
  };

  useEffect(() => {
    fetchChartPermissions();
  }, [user.id]);

  const fetchChartPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_chart_permissions')
        .select('chart_type, page, can_view')
        .eq('user_id', user.id);

      if (error) throw error;

      // Converter para o formato esperado
      const chartPermissions: ChartPermission[] = data?.map(permission => ({
        chartType: permission.chart_type,
        page: permission.page,
        canView: permission.can_view ?? true
      })) || [];

      // Preencher permissões faltantes com valores padrão
      const defaultPermissions = [
        { chartType: 'performance_overview', page: 'creatives', canView: true },
        { chartType: 'time_series', page: 'creatives', canView: true },
        { chartType: 'top_creatives', page: 'creatives', canView: true },
        { chartType: 'metrics_comparison', page: 'creatives', canView: true },
        { chartType: 'sales_summary', page: 'sales', canView: true },
        { chartType: 'conversion_funnel', page: 'sales', canView: true },
        { chartType: 'time_series', page: 'sales', canView: true },
        { chartType: 'affiliate_performance', page: 'affiliates', canView: true },
        { chartType: 'time_series', page: 'affiliates', canView: true },
        { chartType: 'revenue_breakdown', page: 'revenue', canView: true },
        { chartType: 'roi_analysis', page: 'revenue', canView: true },
        { chartType: 'time_series', page: 'revenue', canView: true },
      ];

      const mergedPermissions = defaultPermissions.map(defaultPerm => {
        const existingPerm = chartPermissions.find(
          p => p.chartType === defaultPerm.chartType && p.page === defaultPerm.page
        );
        return existingPerm || defaultPerm;
      });

      setFormData(prev => ({
        ...prev,
        chartPermissions: mergedPermissions
      }));
    } catch (error) {
      console.error('Error fetching chart permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit()) {
      toast({
        title: "Sem permissão",
        description: "Você não tem permissão para editar este usuário.",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);

    try {
      // Atualizar informações do perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          username: formData.username || null,
          phone: formData.phone || null,
          status: formData.status
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Atualizar papel do usuário (apenas se tiver permissão)
      if (canChangeRole()) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: formData.role })
          .eq('user_id', user.id);

        if (roleError) throw roleError;
      }

      // Atualizar permissões de página
      const pagePermissions = Object.entries(formData.pagePermissions)
        .map(([page, canAccess]) => ({
          user_id: user.id,
          page: page as 'creatives' | 'sales' | 'affiliates' | 'revenue' | 'users',
          can_access: canAccess
        }));

      // Deletar permissões existentes e inserir novas
      await supabase
        .from('user_page_permissions')
        .delete()
        .eq('user_id', user.id);

      if (pagePermissions.length > 0) {
        const { error: permissionsError } = await supabase
          .from('user_page_permissions')
          .insert(pagePermissions);

        if (permissionsError) throw permissionsError;
      }

      // Atualizar permissões de gráficos
      const chartPermissions = formData.chartPermissions.map(permission => ({
        user_id: user.id,
        chart_type: permission.chartType as any,
        page: permission.page as 'creatives' | 'sales' | 'affiliates' | 'revenue',
        can_view: permission.canView
      }));

      // Deletar permissões de gráficos existentes e inserir novas
      await supabase
        .from('user_chart_permissions')
        .delete()
        .eq('user_id', user.id);

      if (chartPermissions.length > 0) {
        const { error: chartPermissionsError } = await supabase
          .from('user_chart_permissions')
          .insert(chartPermissions);

        if (chartPermissionsError) throw chartPermissionsError;
      }

      toast({
        title: "Usuário atualizado",
        description: `${formData.fullName} foi atualizado com sucesso.`,
      });

      onUserUpdated();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Ocorreu um erro ao atualizar o usuário.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canEdit()) {
      toast({
        title: "Sem permissão",
        description: "Você não tem permissão para alterar a senha deste usuário.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingPassword(true);

    try {
      // Chamar a função administrativa do Supabase para alterar a senha
      const { error } = await supabase.auth.admin.updateUserById(user.id, {
        password: passwordData.newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha alterada",
        description: "A senha do usuário foi alterada com sucesso.",
      });

      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Ocorreu um erro ao alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handlePagePermissionChange = (page: keyof typeof formData.pagePermissions, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      pagePermissions: {
        ...prev.pagePermissions,
        [page]: checked
      }
    }));
  };

  const handleChartPermissionChange = (chartType: string, page: string, canView: boolean) => {
    setFormData(prev => ({
      ...prev,
      chartPermissions: prev.chartPermissions.map(permission =>
        permission.chartType === chartType && permission.page === page
          ? { ...permission, canView }
          : permission
      )
    }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'gestor':
        return <ShieldCheck className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="text-center text-slate-400 py-8">
            Carregando detalhes do usuário...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Detalhes do Usuário
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {canEdit() ? "Visualize e edite as informações do usuário" : "Visualizar informações do usuário"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={!canEdit()}
                  className="bg-slate-800/50 border-slate-600 text-white disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!canEdit()}
                  className="bg-slate-800/50 border-slate-600 text-white disabled:opacity-60"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Email</Label>
                <Input
                  value={user.email}
                  disabled
                  className="bg-slate-800/50 border-slate-600 text-slate-400"
                />
                <p className="text-xs text-slate-500">O email não pode ser alterado</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!canEdit()}
                  className="bg-slate-800/50 border-slate-600 text-white disabled:opacity-60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={!canEdit()}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-white">Papel</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: 'admin' | 'user' | 'gestor') => setFormData({ ...formData, role: value })}
                  disabled={!canChangeRole()}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="user">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Usuário
                      </div>
                    </SelectItem>
                    <SelectItem value="gestor">
                      <div className="flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Gestor
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <Crown className="w-4 h-4 mr-2" />
                        Administrador
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Seção de Alteração de Senha */}
          {canEdit() && (
            <div className="space-y-4">
              <Separator className="bg-slate-700" />
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Alterar Senha
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  {showPasswordSection ? 'Cancelar' : 'Alterar Senha'}
                </Button>
              </div>
              
              {showPasswordSection && (
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-white">Nova Senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Digite a nova senha"
                        className="bg-slate-800/50 border-slate-600 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">Confirmar Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirme a nova senha"
                        className="bg-slate-800/50 border-slate-600 text-white"
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={updatingPassword}
                  >
                    {updatingPassword ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Permissões de Página */}
          <div className="space-y-4">
            <Separator className="bg-slate-700" />
            <h3 className="text-lg font-medium text-white">Permissões de Acesso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.pagePermissions).map(([page, hasAccess]) => (
                <div key={page} className="flex items-center space-x-2">
                  <Checkbox
                    id={page}
                    checked={hasAccess}
                    onCheckedChange={(checked) => 
                      handlePagePermissionChange(page as keyof typeof formData.pagePermissions, checked as boolean)
                    }
                    disabled={!canEdit()}
                    className="border-slate-600"
                  />
                  <Label htmlFor={page} className="text-white capitalize">
                    {page === 'creatives' ? 'Criativos' : 
                     page === 'sales' ? 'Vendas' : 
                     page === 'affiliates' ? 'Afiliados' : 
                     page === 'revenue' ? 'Receita' : 'Usuários'}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Permissões de Gráficos */}
          {canEdit() && (
            <>
              <Separator className="bg-slate-700" />
              <ChartPermissions
                chartPermissions={formData.chartPermissions}
                onPermissionChange={handleChartPermissionChange}
              />
            </>
          )}

          {/* Informações Adicionais */}
          <div className="space-y-2">
            <Separator className="bg-slate-700" />
            <h3 className="text-lg font-medium text-white">Informações Adicionais</h3>
            <div className="bg-slate-800/30 p-4 rounded-lg space-y-2">
              <p className="text-slate-300">
                <span className="font-medium">Criado em:</span> {new Date(user.created_at).toLocaleString('pt-BR')}
              </p>
              <p className="text-slate-300">
                <span className="font-medium">ID:</span> {user.id}
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            {canEdit() && (
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={updating}
              >
                {updating ? "Atualizando..." : "Salvar Alterações"}
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              {canEdit() ? "Cancelar" : "Fechar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
