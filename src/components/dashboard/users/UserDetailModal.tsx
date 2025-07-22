
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
// Tabs removed - no longer needed for chart permissions
import { supabase } from '@/integrations/supabase/client';
import { UserWithPermissions } from './types';

interface UserDetailModalProps {
  user?: UserWithPermissions;
  isOpen: boolean;
  onClose: () => void;
}

// Chart permissions removed - now controlled by page permissions

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ 
  user, 
  isOpen, 
  onClose 
}) => {
  // Chart permissions removed - now controlled by page permissions

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

        <div className="space-y-4">
          <div>
            <Label>Permissões de Página</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {user.user_page_permissions?.map((permission) => (
                <div key={permission.page} className="flex items-center justify-between p-2 border rounded">
                  <span className="capitalize">{permission.page.replace('-', ' ')}</span>
                  <Badge variant={permission.can_access ? "default" : "destructive"}>
                    {permission.can_access ? 'Permitido' : 'Negado'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Permissões de Gráficos</Label>
            <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto">
              {user.user_chart_permissions?.map((permission) => (
                <div key={permission.chart_type} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{permission.chart_type.replace('_', ' ')}</span>
                  <Badge variant={permission.can_access ? "default" : "destructive"}>
                    {permission.can_access ? 'Permitido' : 'Negado'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
