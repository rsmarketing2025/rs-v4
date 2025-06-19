
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserPermission {
  page: string;
  can_access: boolean;
}

interface UserWithPermissions {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: 'admin' | 'user' | 'business_manager';
  permissions?: UserPermission[];
}

interface UserDetailModalProps {
  user: UserWithPermissions | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate: () => void;
  currentUserRole?: string | null;
  onUpdate?: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdate,
  onUpdate
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [permissions, setPermissions] = useState(() => {
    const initialPermissions: Record<string, boolean> = {};
    
    if (user && user.permissions && Array.isArray(user.permissions)) {
      user.permissions.forEach((permission: UserPermission) => {
        if (permission && permission.page) {
          initialPermissions[permission.page] = permission.can_access || false;
        }
      });
    }
    
    return initialPermissions;
  });
  const { toast } = useToast();

  const availablePages = [
    'creatives',
    'sales', 
    'affiliates',
    'subscriptions',
    'users',
    'business-managers'
  ] as const;

  const handlePermissionChange = (page: typeof availablePages[number], canAccess: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [page]: canAccess
    }));
  };

  const handleSavePermissions = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      // Delete existing permissions
      await supabase
        .from('user_page_permissions')
        .delete()
        .eq('user_id', user.id);

      // Insert new permissions
      const permissionInserts = Object.entries(permissions).map(([page, canAccess]) => ({
        user_id: user.id,
        page: page as typeof availablePages[number],
        can_access: canAccess
      }));

      if (permissionInserts.length > 0) {
        const { error } = await supabase
          .from('user_page_permissions')
          .insert(permissionInserts);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Permissões atualizadas com sucesso",
      });

      onUserUpdate();
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar permissões",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-neutral-900 border-neutral-700">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">
            Detalhes do Usuário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2">
              <img
                src={user.avatar_url || "https://avatar.iran.liara.run/public/boy"}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
              <h2 className="text-lg font-semibold text-white">{user.full_name || "Sem nome"}</h2>
              <Badge variant="secondary">{user.role}</Badge>
            </div>
            <p className="text-gray-400 mt-2">{user.email}</p>
            <p className="text-gray-400">Criado em: {new Date(user.created_at).toLocaleDateString()}</p>
          </div>

          <Separator className="bg-neutral-700" />
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Permissões de Páginas</h3>
            <div className="space-y-3">
              {availablePages.map((page) => (
                <div key={page} className="flex items-center justify-between">
                  <Label htmlFor={page} className="text-gray-300 capitalize">
                    {page === 'business-managers' ? 'Business Managers' : page}
                  </Label>
                  <Switch
                    id={page}
                    checked={permissions[page] || false}
                    onCheckedChange={(checked) => handlePermissionChange(page, checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-700">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-neutral-600 text-gray-300 hover:bg-neutral-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? "Salvando..." : "Salvar Permissões"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
