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
// Tabs removed - no longer needed for chart permissions
import { Switch } from "@/components/ui/switch";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { UserWithPermissions } from './types';
import { ChartType, useChartPermissions } from '@/hooks/useChartPermissions';
import type { Database } from '@/integrations/supabase/types';
import { PasswordResetDialog } from './PasswordResetDialog';

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
  'exports': 'Exports',
  'ai-agents': 'AI Agents',
  'performance': 'Performance'
};

const CHARTS: ChartType[] = [
  'kpi_total_investido',
  'kpi_receita',
  'kpi_ticket_medio',
  'kpi_total_pedidos',
  'creative_performance_chart',
  'creative_sales_chart',
  'sales_summary_cards',
  'sales_chart',
  'country_sales_chart',
  'state_sales_chart',
  'affiliate_chart',
  'subscription_renewals_chart',
  'subscription_status_chart',
  'new_subscribers_chart'
];

const CHART_LABELS: Record<ChartType, string> = {
  'kpi_total_investido': 'KPI - Total Investido',
  'kpi_receita': 'KPI - Receita',
  'kpi_ticket_medio': 'KPI - Ticket Médio',
  'kpi_total_pedidos': 'KPI - Total de Pedidos',
  'creative_performance_chart': 'Gráfico - Performance Criativa',
  'creative_sales_chart': 'Gráfico - Vendas Criativas',
  'sales_summary_cards': 'Cards - Resumo de Vendas',
  'sales_chart': 'Gráfico - Vendas',
  'country_sales_chart': 'Gráfico - Vendas por País',
  'state_sales_chart': 'Gráfico - Vendas por Estado',
  'affiliate_chart': 'Gráfico - Afiliados',
  'subscription_renewals_chart': 'Gráfico - Renovações',
  'subscription_status_chart': 'Gráfico - Status de Assinaturas',
  'new_subscribers_chart': 'Gráfico - Novos Assinantes'
};

// Chart permissions removed - now controlled by page permissions only

export const UserForm: React.FC<UserFormProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onUserUpdate 
}) => {
  const { toast } = useToast();
  const { refreshChartPermissions } = useChartPermissions();
  const [loading, setLoading] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    role: 'user' as AppRole,
    is_active: true,
    permissions: {} as Record<UserPage, boolean>,
    chartPermissions: {} as Record<ChartType, boolean>
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

        // Create a complete chart permissions object
        const userChartPermissions = CHARTS.reduce((acc, chart) => {
          const permission = user.user_chart_permissions?.find(p => p.chart_type === chart);
          acc[chart] = permission?.can_access || false;
          return acc;
        }, {} as Record<ChartType, boolean>);

        setFormData({
          full_name: user.full_name || '',
          email: user.email || '',
          username: user.username || '',
          password: '', // Not used for existing users
          role: user.role,
          is_active: user.is_active || false,
          permissions: userPermissions,
          chartPermissions: userChartPermissions
        });
      } else {
        // Default permissions for new users - ensure all pages are included
        const defaultPermissions = PAGES.reduce((acc, page) => {
          acc[page] = page !== 'users'; // All pages except users
          return acc;
        }, {} as Record<UserPage, boolean>);

        // Default chart permissions for new users - all false
        const defaultChartPermissions = CHARTS.reduce((acc, chart) => {
          acc[chart] = false;
          return acc;
        }, {} as Record<ChartType, boolean>);

        setFormData({
          full_name: '',
          email: '',
          username: '',
          password: '',
          role: 'user',
          is_active: true,
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
        console.log('🔄 Starting user update for:', user.id);
        console.log('📊 Chart permissions to update:', formData.chartPermissions);

        // Use a transaction-like approach to ensure all updates succeed
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            username: formData.username,
            is_active: formData.is_active,
          })
          .eq('id', user.id);

        if (profileError) {
          console.error('❌ Profile update error:', profileError);
          throw profileError;
        }
        console.log('✅ Profile updated successfully');

        // Update role
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: formData.role })
          .eq('user_id', user.id);

        if (roleError) {
          console.error('❌ Role update error:', roleError);
          throw roleError;
        }
        console.log('✅ Role updated successfully');

        // Update page permissions
        console.log('🔄 Updating page permissions...');
        for (const page of PAGES) {
          const pageTyped = page as UserPage;
          console.log(`📄 Updating page permission for ${page}:`, formData.permissions[pageTyped]);
          
          const { error: permError, data: permData } = await supabase
            .from('user_page_permissions')
            .update({ can_access: formData.permissions[pageTyped] })
            .eq('user_id', user.id)
            .eq('page', pageTyped)
            .select();

          if (permError) {
            console.error(`❌ Page permission update error for ${page}:`, permError);
            throw permError;
          }
          
          console.log(`✅ Page permission updated for ${page}:`, permData);
        }

        // Update chart permissions with detailed logging and validation
        console.log('🔄 Updating chart permissions...');
        const chartUpdateResults = [];
        
        for (const chart of CHARTS) {
          const newValue = formData.chartPermissions[chart];
          console.log(`📊 Updating chart permission for ${chart}:`, newValue);
          
          // First, verify current value in database
          const { data: currentData, error: selectError } = await supabase
            .from('user_chart_permissions')
            .select('can_access')
            .eq('user_id', user.id)
            .eq('chart_type', chart)
            .single();

          if (selectError) {
            console.error(`❌ Failed to fetch current chart permission for ${chart}:`, selectError);
            throw selectError;
          }

          console.log(`📊 Current value for ${chart}:`, currentData?.can_access, '→ New value:', newValue);

          // Only update if value actually changed
          if (currentData?.can_access !== newValue) {
            const { error: chartPermError, data: chartPermData } = await supabase
              .from('user_chart_permissions')
              .update({ can_access: newValue })
              .eq('user_id', user.id)
              .eq('chart_type', chart)
              .select();

            if (chartPermError) {
              console.error(`❌ Chart permission update error for ${chart}:`, chartPermError);
              throw chartPermError;
            }

            console.log(`✅ Chart permission updated for ${chart}:`, chartPermData);
            chartUpdateResults.push({ chart, oldValue: currentData?.can_access, newValue, success: true });
          } else {
            console.log(`⏭️ No change needed for ${chart}`);
            chartUpdateResults.push({ chart, oldValue: currentData?.can_access, newValue, success: true, skipped: true });
          }
        }

        // Verify all chart permissions were actually updated
        console.log('🔍 Verifying chart permissions were saved...');
        const { data: verificationData, error: verificationError } = await supabase
          .from('user_chart_permissions')
          .select('chart_type, can_access')
          .eq('user_id', user.id);

        if (verificationError) {
          console.error('❌ Verification error:', verificationError);
          throw verificationError;
        }

        console.log('📊 Final chart permissions in database:', verificationData);
        
        // Check if any updates failed to persist
        const failedUpdates = [];
        for (const chart of CHARTS) {
          const expectedValue = formData.chartPermissions[chart];
          const actualValue = verificationData?.find(p => p.chart_type === chart)?.can_access;
          
          if (expectedValue !== actualValue) {
            failedUpdates.push({ chart, expected: expectedValue, actual: actualValue });
          }
        }

        if (failedUpdates.length > 0) {
          console.error('❌ Chart permission verification failed:', failedUpdates);
          throw new Error(`Failed to update chart permissions: ${failedUpdates.map(f => f.chart).join(', ')}`);
        }

        console.log('✅ All chart permissions verified successfully');
        console.log('📊 Chart update results:', chartUpdateResults);

        // Trigger chart permissions refresh in the global hook
        setTimeout(() => {
          console.log('🔄 Triggering chart permissions refresh after update');
          refreshChartPermissions();
        }, 1000);

        toast({
          title: "Sucesso!",
          description: "Usuário atualizado com sucesso.",
        });
      } else {
        // Create new user via edge function
        console.log('🔄 Creating new user via edge function');
        
        // Prepare data for edge function
        const createUserData = {
          email: formData.email,
          password: formData.password,
          fullName: formData.full_name, // Edge function expects fullName
          username: formData.username,
          role: formData.role,
          isActive: formData.is_active,
          pagePermissions: formData.permissions,
          chartPermissions: formData.chartPermissions
        };

        console.log('📊 Sending user creation data:', createUserData);

        const { data: response, error: createError } = await supabase.functions.invoke('create-user', {
          body: { formData: createUserData }
        });

        if (createError) {
          console.error('❌ Edge function error:', createError);
          throw new Error(`Falha ao criar usuário: ${createError.message}`);
        }

        if (!response?.success) {
          console.error('❌ User creation failed:', response);
          throw new Error(response?.error || 'Falha ao criar usuário');
        }

        console.log('✅ User created successfully via edge function');

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
    const allSelected = CHARTS.reduce((acc, chart) => {
      acc[chart] = true;
      return acc;
    }, {} as Record<ChartType, boolean>);
    
    setFormData(prev => ({ ...prev, chartPermissions: allSelected }));
  };

  const handleDeselectAllCharts = () => {
    const allDeselected = CHARTS.reduce((acc, chart) => {
      acc[chart] = false;
      return acc;
    }, {} as Record<ChartType, boolean>);
    
    setFormData(prev => ({ ...prev, chartPermissions: allDeselected }));
  };

  // Chart permissions functions removed - now controlled by page permissions

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

          {!user && (
            <div>
              <Label htmlFor="password" className="text-white">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                className="bg-neutral-800 border-neutral-700 text-white"
                placeholder="Digite uma senha para o usuário"
              />
            </div>
          )}

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

          <div className="space-y-3">
            <Label className="text-white">Status da Conta</Label>
            <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${formData.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-white text-sm">
                  {formData.is_active ? 'Usuário Ativo' : 'Usuário Inativo'}
                </span>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => {
                  setFormData(prev => ({ ...prev, is_active: checked }));
                }}
              />
            </div>
            {!formData.is_active && (
              <p className="text-red-400 text-xs">
                Usuários inativos não conseguirão fazer login no sistema
              </p>
            )}
          </div>

          {user && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsPasswordResetOpen(true)}
              className="w-full border-neutral-700 text-white hover:bg-neutral-800"
            >
              🔒 Redefinir Senha
            </Button>
          )}

          <div className="space-y-4">
            <div className="space-y-4">
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
            </div>

              <div className="space-y-4">
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
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {CHARTS.map((chart) => (
                    <div key={chart} className="flex items-center justify-between">
                      <Label htmlFor={chart} className="text-white text-sm">
                        {CHART_LABELS[chart]}
                      </Label>
                      <Switch
                        id={chart}
                        checked={formData.chartPermissions[chart] || false}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            chartPermissions: {
                              ...prev.chartPermissions,
                              [chart]: checked
                            }
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
            </div>
          </div>

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
      
      {/* Password Reset Dialog */}
      {user && (
        <PasswordResetDialog
          isOpen={isPasswordResetOpen}
          onClose={() => setIsPasswordResetOpen(false)}
          userId={user.id}
          userName={user.full_name || user.email || 'Usuario'}
        />
      )}
    </Dialog>
  );
};
