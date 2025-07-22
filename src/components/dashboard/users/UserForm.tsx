import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { UserWithPermissions } from './types';
import type { Database } from '@/integrations/supabase/types';

type UserPage = Database['public']['Enums']['user_page'];
type AppRole = Database['public']['Enums']['app_role'];

interface UserFormProps {
  user?: UserWithPermissions;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: () => void;
}

const PAGES: UserPage[] = [
  'creatives',
  'sales', 
  'affiliates',
  'revenue',
  'users',
  'business-managers',
  'subscriptions',
  'kpis',
  'charts',
  'tables',
  'exports'
];

const PAGE_LABELS: Record<UserPage, string> = {
  'creatives': 'Creatives',
  'sales': 'Sales',
  'affiliates': 'Affiliates', 
  'revenue': 'Revenue',
  'users': 'Users',
  'business-managers': 'Business Managers',
  'subscriptions': 'Subscriptions',
  'kpis': 'AI Agents',
  'charts': 'Performance',
  'tables': 'Tables',
  'exports': 'Exports'
};

const CHART_PERMISSIONS = [
  { id: 'kpi-total-investido', label: 'KPI - Total Investido' },
  { id: 'kpi-receita', label: 'KPI - Receita' },
  { id: 'kpi-ticket-medio', label: 'KPI - Ticket Médio' },
  { id: 'kpi-total-pedidos', label: 'KPI - Total de Pedidos' },
  { id: 'grafico-performance-criativa', label: 'Gráfico de Performance Criativa' },
  { id: 'grafico-vendas-criativas', label: 'Gráfico de Vendas Criativas' },
  { id: 'cards-resumo-vendas', label: 'Cards Resumo de Vendas' }
];

export const UserForm: React.FC<UserFormProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onUserUpdate 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    role: 'user' as AppRole,
    permissions: {} as Record<UserPage, boolean>,
    chartPermissions: {} as Record<string, boolean>
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        // Create a complete permissions object with all pages
        const userPermissions = PAGES.reduce((acc, page) => {
          const permission = user.user_page_permissions?.find(p => p.page === page);
          acc[page] = permission?.can_access || false;
          return acc;
        }, {} as Record<UserPage, boolean>);

        // Fetch chart permissions for existing user
        const { data: chartPerms } = await supabase
          .from('user_chart_permissions')
          .select('chart_id, can_access')
          .eq('user_id', user.id);

        const userChartPermissions = CHART_PERMISSIONS.reduce((acc, chart) => {
          const permission = chartPerms?.find(p => p.chart_id === chart.id);
          acc[chart.id] = permission?.can_access || false;
          return acc;
        }, {} as Record<string, boolean>);

        setFormData({
          full_name: user.full_name || '',
          email: user.email || '',
          username: user.username || '',
          role: user.role,
          permissions: userPermissions,
          chartPermissions: userChartPermissions
        });
      } else {
        // Default permissions for new users - ensure all pages are included
        const defaultPermissions = PAGES.reduce((acc, page) => {
          acc[page] = page !== 'users'; // All pages except users
          return acc;
        }, {} as Record<UserPage, boolean>);

        const defaultChartPermissions = CHART_PERMISSIONS.reduce((acc, chart) => {
          acc[chart.id] = true;
          return acc;
        }, {} as Record<string, boolean>);

        setFormData({
          full_name: '',
          email: '',
          username: '',
          role: 'user',
          permissions: defaultPermissions,
          chartPermissions: defaultChartPermissions
        });
      }
    };

    loadUserData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Update existing user
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            username: formData.username,
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // Update role
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: formData.role })
          .eq('user_id', user.id);

        if (roleError) throw roleError;

        // Update permissions
        for (const page of PAGES) {
          const pageTyped = page as UserPage;
          const { error: permError } = await supabase
            .from('user_page_permissions')
            .update({ can_access: formData.permissions[pageTyped] })
            .eq('user_id', user.id)
            .eq('page', pageTyped);

          if (permError) throw permError;
        }

        // Update chart permissions
        for (const chart of CHART_PERMISSIONS) {
          const { error: chartPermError } = await supabase
            .from('user_chart_permissions')
            .upsert({
              user_id: user.id,
              chart_id: chart.id,
              can_access: formData.chartPermissions[chart.id]
            });

          if (chartPermError) throw chartPermError;
        }

        toast({
          title: "Sucesso!",
          description: "Usuário atualizado com sucesso.",
        });
      } else {
        // Create new user via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          email_confirm: true,
          user_metadata: {
            full_name: formData.full_name,
            username: formData.username,
            role: formData.role
          }
        });

        if (authError) throw authError;

        const userId = authData.user?.id;
        if (!userId) throw new Error('Failed to create user');

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: formData.full_name,
            email: formData.email,
            username: formData.username,
          });

        if (profileError) throw profileError;

        // Set role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: formData.role,
          });

        if (roleError) throw roleError;

        // Set permissions
        const permissionInserts = PAGES.map(page => ({
          user_id: userId,
          page: page as UserPage,
          can_access: formData.permissions[page as UserPage]
        }));

        const { error: permError } = await supabase
          .from('user_page_permissions')
          .insert(permissionInserts);

        if (permError) throw permError;

        // Set chart permissions
        const chartPermissionInserts = CHART_PERMISSIONS.map(chart => ({
          user_id: userId,
          chart_id: chart.id,
          can_access: formData.chartPermissions[chart.id]
        }));

        const { error: chartPermError } = await supabase
          .from('user_chart_permissions')
          .insert(chartPermissionInserts);

        if (chartPermError) throw chartPermError;

        toast({
          title: "Sucesso!",
          description: "Usuário criado com sucesso.",
        });
      }

      onClose();
      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (error: any) {
      toast({
        title: "Erro!",
        description: `Falha ao ${user ? 'atualizar' : 'criar'} usuário: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAllPages = () => {
    const allSelected = PAGES.reduce((acc, page) => {
      acc[page] = true;
      return acc;
    }, {} as Record<UserPage, boolean>);
    
    setFormData(prev => ({ ...prev, permissions: allSelected }));
  };

  const handleDeselectAllPages = () => {
    const allDeselected = PAGES.reduce((acc, page) => {
      acc[page] = false;
      return acc;
    }, {} as Record<UserPage, boolean>);
    
    setFormData(prev => ({ ...prev, permissions: allDeselected }));
  };

  const handleSelectAllCharts = () => {
    const allSelected = CHART_PERMISSIONS.reduce((acc, chart) => {
      acc[chart.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setFormData(prev => ({ ...prev, chartPermissions: allSelected }));
  };

  const handleDeselectAllCharts = () => {
    const allDeselected = CHART_PERMISSIONS.reduce((acc, chart) => {
      acc[chart.id] = false;
      return acc;
    }, {} as Record<string, boolean>);
    
    setFormData(prev => ({ ...prev, chartPermissions: allDeselected }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-white">{user ? 'Editar Usuário' : 'Criar Usuário'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name" className="text-white">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                required
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!!user}
              required
              className="bg-neutral-800 border-neutral-700 text-white disabled:text-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-white">Role</Label>
            <Select value={formData.role} onValueChange={(value: AppRole) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700">
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="business_manager">Gestor de Negócios</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {user && (
            <div className="flex items-center space-x-2 p-3 bg-neutral-800 rounded-lg">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-white text-sm">Status: Usuário Ativo</span>
            </div>
          )}

          {user && (
            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-neutral-700 text-white hover:bg-neutral-800"
            >
              🔒 Redefinir Senha
            </Button>
          )}

          <Tabs defaultValue="pages" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-neutral-800">
              <TabsTrigger value="pages" className="text-white data-[state=active]:bg-neutral-700">
                Permissões de Página
              </TabsTrigger>
              <TabsTrigger value="charts" className="text-white data-[state=active]:bg-neutral-700">
                Permissões de Gráficos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pages" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-white">Permissões de Página</Label>
                <div className="space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleSelectAllPages}
                    className="border-neutral-700 text-white hover:bg-neutral-800"
                  >
                    Marcar Tudo
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleDeselectAllPages}
                    className="border-neutral-700 text-white hover:bg-neutral-800"
                  >
                    Desmarcar Tudo
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {PAGES.map((page) => (
                  <div key={page} className="flex items-center justify-between">
                    <Label htmlFor={page} className="text-white text-sm">
                      {PAGE_LABELS[page]}
                    </Label>
                    <Switch
                      id={page}
                      checked={formData.permissions[page] || false}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            [page]: checked
                          }
                        }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="charts" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-white">Permissões de Gráficos</Label>
                <div className="space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleSelectAllCharts}
                    className="border-neutral-700 text-white hover:bg-neutral-800"
                  >
                    Marcar Tudo
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleDeselectAllCharts}
                    className="border-neutral-700 text-white hover:bg-neutral-800"
                  >
                    Desmarcar Tudo
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {CHART_PERMISSIONS.map((chart) => (
                  <div key={chart.id} className="flex items-center justify-between">
                    <Label htmlFor={chart.id} className="text-white text-sm">
                      {chart.label}
                    </Label>
                    <Switch
                      id={chart.id}
                      checked={formData.chartPermissions[chart.id] || false}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          chartPermissions: {
                            ...prev.chartPermissions,
                            [chart.id]: checked
                          }
                        }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-neutral-700 text-white hover:bg-neutral-800">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Salvando...' : user ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
