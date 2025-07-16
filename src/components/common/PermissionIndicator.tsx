import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ShieldCheck, ShieldX, RefreshCw } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";

interface PermissionIndicatorProps {
  showAllPages?: boolean;
  compact?: boolean;
}

export const PermissionIndicator: React.FC<PermissionIndicatorProps> = ({
  showAllPages = false,
  compact = false
}) => {
  const { permissions, loading, error, refreshPermissions } = usePermissions();
  const { isAdmin } = useAuth();

  const allPages = [
    { key: 'creatives', label: 'Criativos' },
    { key: 'sales', label: 'Vendas' },
    { key: 'affiliates', label: 'Afiliados' },
    { key: 'subscriptions', label: 'Assinaturas' },
    { key: 'users', label: 'Usuários' },
    { key: 'business-managers', label: 'Business Managers' }
  ];

  const getPermissionStatus = (page: string) => {
    if (isAdmin) return 'admin';
    const permission = permissions.pages.find(p => p.page === page);
    return permission?.can_access ? 'allowed' : 'denied';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'admin':
        return <Shield className="w-4 h-4 text-yellow-500" />;
      case 'allowed':
        return <ShieldCheck className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <ShieldX className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'admin':
        return 'default';
      case 'allowed':
        return 'secondary';
      case 'denied':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'admin':
        return 'Admin';
      case 'allowed':
        return 'Permitido';
      case 'denied':
        return 'Negado';
      default:
        return 'Desconhecido';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {loading ? (
          <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
        ) : error ? (
          <Badge variant="destructive" className="text-xs">
            Erro
          </Badge>
        ) : isAdmin ? (
          <Badge className="text-xs bg-yellow-500 text-black">
            <Shield className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Usuário
          </Badge>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Carregando Permissões...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
            <ShieldX className="w-4 h-4 text-red-500" />
            Erro nas Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400 mb-3">{error}</p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={refreshPermissions}
            className="w-full"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const pagesToShow = showAllPages 
    ? allPages 
    : allPages.filter(page => {
        const status = getPermissionStatus(page.key);
        return status === 'admin' || status === 'allowed';
      });

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Suas Permissões
          </CardTitle>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={refreshPermissions}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isAdmin && (
          <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
            <p className="text-xs text-yellow-400 font-medium">
              Você é um administrador e tem acesso total ao sistema.
            </p>
          </div>
        )}
        
        {pagesToShow.map((page) => {
          const status = getPermissionStatus(page.key);
          return (
            <div key={page.key} className="flex items-center justify-between">
              <span className="text-xs text-slate-300">{page.label}</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(status)}
                <Badge 
                  variant={getStatusBadgeVariant(status)} 
                  className="text-xs"
                >
                  {getStatusText(status)}
                </Badge>
              </div>
            </div>
          );
        })}

        {!showAllPages && !isAdmin && permissions.pages.length < allPages.length && (
          <div className="pt-2 border-t border-slate-700">
            <p className="text-xs text-slate-400">
              {allPages.length - permissions.pages.filter(p => p.can_access).length} páginas não acessíveis
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};