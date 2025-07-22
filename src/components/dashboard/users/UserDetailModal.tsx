
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { UserWithPermissions } from './types';

interface UserDetailModalProps {
  user?: UserWithPermissions;
  isOpen: boolean;
  onClose: () => void;
}

interface ChartPermission {
  chart_id: string;
  can_access: boolean;
}

const CHART_LABELS: Record<string, string> = {
  'kpi-total-investido': 'KPI - Total Investido',
  'kpi-receita': 'KPI - Receita',
  'kpi-ticket-medio': 'KPI - Ticket Médio',
  'kpi-total-pedidos': 'KPI - Total de Pedidos',
  'grafico-performance-criativa': 'Gráfico de Performance Criativa',
  'grafico-vendas-criativas': 'Gráfico de Vendas Criativas',
  'cards-resumo-vendas': 'Cards Resumo de Vendas'
};

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ 
  user, 
  isOpen, 
  onClose 
}) => {
  const [chartPermissions, setChartPermissions] = useState<ChartPermission[]>([]);
  const [loadingChartPermissions, setLoadingChartPermissions] = useState(false);

  useEffect(() => {
    const fetchChartPermissions = async () => {
      if (!user?.id) return;
      
      setLoadingChartPermissions(true);
      try {
        const { data, error } = await supabase
          .from('user_chart_permissions')
          .select('chart_id, can_access')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching chart permissions:', error);
        } else {
          setChartPermissions(data || []);
        }
      } catch (error) {
        console.error('Unexpected error fetching chart permissions:', error);
      } finally {
        setLoadingChartPermissions(false);
      }
    };

    if (isOpen && user) {
      fetchChartPermissions();
    }
  }, [user, isOpen]);

  if (!user) return null;

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-600 hover:bg-red-700",
      business_manager: "bg-blue-600 hover:bg-blue-700",
      user: "bg-green-600 hover:bg-green-700"
    };
    return <Badge className={colors[role as keyof typeof colors] || "bg-gray-600"}>{role}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label>Nome Completo</Label>
            <Input value={user.full_name || 'N/A'} readOnly />
          </div>
          
          <div>
            <Label>Role</Label>
            <div className="pt-2">
              {getRoleBadge(user.role)}
            </div>
          </div>
          
          <div>
            <Label>Email</Label>
            <Input value={user.email || 'N/A'} readOnly />
          </div>
          
          <div>
            <Label>Username</Label>
            <Input value={user.username || 'N/A'} readOnly />
          </div>
          
          <div>
            <Label>Criado em</Label>
            <Input value={user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'} readOnly />
          </div>
          
          <div>
            <Label>Atualizado em</Label>
            <Input value={user.updated_at ? new Date(user.updated_at).toLocaleDateString('pt-BR') : 'N/A'} readOnly />
          </div>
        </div>

        <Tabs defaultValue="pages" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pages">Permissões de Página</TabsTrigger>
            <TabsTrigger value="charts">Permissões de Gráficos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pages" className="space-y-4">
            <Label>Permissões de Página</Label>
            <div className="grid grid-cols-2 gap-2">
              {user.user_page_permissions?.map((permission) => (
                <div key={permission.page} className="flex items-center justify-between p-2 border rounded">
                  <span className="capitalize">{permission.page.replace('-', ' ')}</span>
                  <Badge variant={permission.can_access ? "default" : "destructive"}>
                    {permission.can_access ? 'Permitido' : 'Negado'}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="charts" className="space-y-4">
            <Label>Permissões de Gráficos</Label>
            {loadingChartPermissions ? (
              <div className="flex items-center justify-center p-4">
                <span>Carregando permissões de gráficos...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {chartPermissions.map((permission) => (
                  <div key={permission.chart_id} className="flex items-center justify-between p-2 border rounded">
                    <span>{CHART_LABELS[permission.chart_id] || permission.chart_id}</span>
                    <Badge variant={permission.can_access ? "default" : "destructive"}>
                      {permission.can_access ? 'Permitido' : 'Negado'}
                    </Badge>
                  </div>
                ))}
                {chartPermissions.length === 0 && (
                  <div className="text-center text-gray-500 p-4">
                    Nenhuma permissão de gráfico encontrada
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
