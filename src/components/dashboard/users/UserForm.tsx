
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, ShieldCheck, Crown, X } from 'lucide-react';
import { ChartPermissions } from './ChartPermissions';

interface ChartPermission {
  chartType: string;
  page: string;
  canView: boolean;
}

interface UserFormData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: 'admin' | 'user' | 'gestor';
  status: 'active' | 'inactive';
  pagePermissions: {
    creatives: boolean;
    sales: boolean;
    affiliates: boolean;
    revenue: boolean;
    users: boolean;
  };
  chartPermissions: ChartPermission[];
}

interface UserFormProps {
  onClose: () => void;
  onUserCreated: () => void;
  currentUserRole: string | null;
}

export const UserForm: React.FC<UserFormProps> = ({ onClose, onUserCreated, currentUserRole }) => {
  const [formData, setFormData] = useState<UserFormData>({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    status: 'active',
    pagePermissions: {
      creatives: true,
      sales: true,
      affiliates: true,
      revenue: true,
      users: false,
    },
    chartPermissions: [
      // Permissões padrão para gráficos
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
    ]
  });
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const { session, refreshSession } = useAuth();

  // Verificar quais papéis o usuário atual pode atribuir
  const getAvailableRoles = () => {
    if (currentUserRole === 'admin') {
      return ['user', 'gestor', 'admin'];
    } else if (currentUserRole === 'gestor') {
      return ['user'];
    }
    return ['user'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      console.log('Criando usuário com dados:', formData);

      // Verificar se temos sessão válida
      if (!session) {
        throw new Error('Você precisa estar logado para criar usuários');
      }

      // Verificar se a sessão está prestes a expirar
      const now = Date.now();
      const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
      
      if (expiresAt < now + 60000) {
        console.log('Sessão expirando, renovando...');
        try {
          await refreshSession();
          const { data: { session: newSession } } = await supabase.auth.getSession();
          if (!newSession) {
            throw new Error('Falha ao renovar sessão. Faça login novamente.');
          }
        } catch (refreshError) {
          console.error('Falha ao renovar sessão:', refreshError);
          throw new Error('Sessão expirada. Faça login novamente.');
        }
      }

      // Obter sessão atual
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !currentSession?.access_token) {
        throw new Error('Sessão inválida. Faça login novamente.');
      }

      console.log('Chamando função para criar usuário...');

      // Preparar dados para envio - estrutura corrigida
      const requestData = {
        formData: formData
      };

      console.log('Dados preparados para envio:', requestData);

      // Chamar a Edge Function para criar o usuário
      const response = await fetch(`https://cnhjnfwkjakvxamefzzg.supabase.co/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentSession.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Usuário criado com sucesso:', data);

      toast({
        title: "Usuário criado com sucesso!",
        description: `${formData.fullName} foi adicionado ao sistema com o papel ${formData.role}.`,
      });

      onUserCreated();
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      
      let errorMessage = error.message || "Ocorreu um erro ao criar o usuário.";
      
      // Tratar casos específicos de erro
      if (errorMessage.includes('Invalid authentication') || errorMessage.includes('refresh_token_not_found')) {
        errorMessage = "Sessão expirada. Por favor, faça login novamente.";
      } else if (errorMessage.includes('Admin access required')) {
        errorMessage = "Você não tem permissão para criar usuários. Acesso de administrador necessário.";
      }
      
      toast({
        title: "Erro ao criar usuário",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handlePagePermissionChange = (page: keyof UserFormData['pagePermissions'], checked: boolean) => {
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

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Criar Novo Usuário
          </CardTitle>
          <CardDescription className="text-slate-400">
            Preencha as informações para criar um novo usuário no sistema
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          className="text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white">Nome Completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Digite o nome completo"
                  required
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white">Nome de Usuário</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="username"
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@exemplo.com"
                  required
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-white">Papel *</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: 'admin' | 'user' | 'gestor') => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    {getAvailableRoles().includes('user') && (
                      <SelectItem value="user">
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Usuário
                        </div>
                      </SelectItem>
                    )}
                    {getAvailableRoles().includes('gestor') && (
                      <SelectItem value="gestor">
                        <div className="flex items-center">
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Gestor
                        </div>
                      </SelectItem>
                    )}
                    {getAvailableRoles().includes('admin') && (
                      <SelectItem value="admin">
                        <div className="flex items-center">
                          <Crown className="w-4 h-4 mr-2" />
                          Administrador
                        </div>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Permissões de Página */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Permissões de Acesso às Páginas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData.pagePermissions).map(([page, hasAccess]) => (
                <div key={page} className="flex items-center space-x-2">
                  <Checkbox
                    id={page}
                    checked={hasAccess}
                    onCheckedChange={(checked) => 
                      handlePagePermissionChange(page as keyof UserFormData['pagePermissions'], checked as boolean)
                    }
                    className="border-slate-600"
                  />
                  <Label htmlFor={page} className="text-white">
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
          <ChartPermissions
            chartPermissions={formData.chartPermissions}
            onPermissionChange={handleChartPermissionChange}
          />

          {/* Ações do Formulário */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={creating}
            >
              {creating ? "Criando..." : "Criar Usuário"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
