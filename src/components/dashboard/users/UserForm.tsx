
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, ShieldCheck, X } from 'lucide-react';
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
  role: 'admin' | 'user';
  pagePermissions: {
    creatives: boolean;
    sales: boolean;
    affiliates: boolean;
    revenue: boolean;
  };
  chartPermissions: ChartPermission[];
}

interface UserFormProps {
  onClose: () => void;
  onUserCreated: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ onClose, onUserCreated }) => {
  const [formData, setFormData] = useState<UserFormData>({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    pagePermissions: {
      creatives: true,
      sales: true,
      affiliates: true,
      revenue: true,
    },
    chartPermissions: [
      // Default chart permissions for each page
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Create user via Supabase Auth Admin
      const { data, error } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        user_metadata: {
          full_name: formData.fullName
        },
        email_confirm: true
      });

      if (error) throw error;
      if (!data.user) throw new Error('Usuário não foi criado');

      // Update profile with additional information
      await supabase
        .from('profiles')
        .update({
          username: formData.username,
          phone: formData.phone
        })
        .eq('id', data.user.id);

      // Set user role if admin
      if (formData.role === 'admin') {
        await supabase
          .from('user_roles')
          .update({ role: 'admin' })
          .eq('user_id', data.user.id);
      }

      // Set page permissions
      const pagePermissions = Object.entries(formData.pagePermissions)
        .filter(([_, canAccess]) => canAccess)
        .map(([page, canAccess]) => ({
          user_id: data.user.id,
          page: page as 'creatives' | 'sales' | 'affiliates' | 'revenue',
          can_access: canAccess
        }));

      if (pagePermissions.length > 0) {
        await supabase
          .from('user_page_permissions')
          .upsert(pagePermissions);
      }

      // Set chart permissions with proper type casting
      const chartPermissions = formData.chartPermissions
        .filter(permission => permission.canView)
        .map(permission => ({
          user_id: data.user.id,
          chart_type: permission.chartType as 'performance_overview' | 'time_series' | 'top_creatives' | 'metrics_comparison' | 'conversion_funnel' | 'roi_analysis' | 'sales_summary' | 'affiliate_performance' | 'revenue_breakdown',
          page: permission.page as 'creatives' | 'sales' | 'affiliates' | 'revenue',
          can_view: permission.canView
        }));

      if (chartPermissions.length > 0) {
        await supabase
          .from('user_chart_permissions')
          .upsert(chartPermissions);
      }

      toast({
        title: "Usuário criado com sucesso!",
        description: `${formData.fullName} foi adicionado ao sistema.`,
      });

      onUserCreated();
      onClose();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro ao criar o usuário.",
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
          <CardTitle className="text-white">Novo Usuário</CardTitle>
          <CardDescription className="text-slate-400">
            Preencha as informações para criar um novo usuário
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
          {/* Basic Information */}
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
                <Label htmlFor="phone" className="text-white">Telefone/WhatsApp</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="role" className="text-white">Perfil *</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: 'admin' | 'user') => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="user">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Usuário
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Administrador
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Page Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Permissões de Acesso</h3>
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
                  <Label htmlFor={page} className="text-white capitalize">
                    {page === 'creatives' ? 'Criativos' : 
                     page === 'sales' ? 'Vendas' : 
                     page === 'affiliates' ? 'Afiliados' : 'Receita'}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Permissions */}
          <ChartPermissions
            chartPermissions={formData.chartPermissions}
            onPermissionChange={handleChartPermissionChange}
          />

          {/* Form Actions */}
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
