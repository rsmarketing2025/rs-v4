
import React from 'react';
import { Card } from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";

interface DashboardLoadingStateProps {
  type: 'loading' | 'access-denied';
}

export const DashboardLoadingState: React.FC<DashboardLoadingStateProps> = ({ type }) => {
  return (
    <SidebarInset>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        {type === 'loading' ? (
          <div className="text-white text-lg">Carregando permissões...</div>
        ) : (
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Acesso Negado</h2>
            <p className="text-slate-400">Você não tem permissão para acessar esta página.</p>
          </Card>
        )}
      </div>
    </SidebarInset>
  );
};
