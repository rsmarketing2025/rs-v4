
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  full_name: string;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'business_manager';
  permissions: {
    creatives: boolean;
    sales: boolean;
    affiliates: boolean;
    revenue: boolean;
    users: boolean;
    'business-managers': boolean;
    subscriptions: boolean;
  };
}

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  currentUserRole?: string | null;
  onUpdate?: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onUserUpdated,
  currentUserRole,
  onUpdate
}) => {
  const [loading, setLoading] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(user);
  const { toast } = useToast();

  React.useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleSave = async () => {
    if (!editedUser) return;

    setLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editedUser.full_name,
          username: editedUser.username
        })
        .eq('id', editedUser.id);

      if (profileError) throw profileError;

      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: editedUser.role })
        .eq('user_id', editedUser.id);

      if (roleError) throw roleError;

      // Update permissions - handle the 'business-managers' key properly
      const permissionUpdates = Object.entries(editedUser.permissions).map(([page, canAccess]) => {
        // Map 'business-managers' to the correct database value
        const dbPageName = page === 'business-managers' ? 'business-managers' as const : page;
        
        return supabase
          .from('user_page_permissions')
          .update({ can_access: canAccess })
          .eq('user_id', editedUser.id)
          .eq('page', dbPageName);
      });

      await Promise.all(permissionUpdates);

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
      });

      onUserUpdated();
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!editedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
          <DialogDescription>
            Edite as informações e permissões do usuário
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                value={editedUser.full_name}
                onChange={(e) => setEditedUser({
                  ...editedUser,
                  full_name: e.target.value
                })}
              />
            </div>
            <div>
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                value={editedUser.username}
                onChange={(e) => setEditedUser({
                  ...editedUser,
                  username: e.target.value
                })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={editedUser.email}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="role">Função</Label>
            <Select
              value={editedUser.role}
              onValueChange={(value: 'user' | 'admin' | 'business_manager') => 
                setEditedUser({ ...editedUser, role: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="business_manager">Gestor de Negócios</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Permissões de Página</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {Object.entries(editedUser.permissions).map(([page, hasAccess]) => (
                <div key={page} className="flex items-center space-x-2">
                  <Checkbox
                    id={page}
                    checked={hasAccess}
                    onCheckedChange={(checked) => {
                      setEditedUser({
                        ...editedUser,
                        permissions: {
                          ...editedUser.permissions,
                          [page]: !!checked
                        }
                      });
                    }}
                  />
                  <Label htmlFor={page} className="capitalize">
                    {page === 'business-managers' ? 'Gestores de Negócio' : 
                     page === 'creatives' ? 'Criativos' :
                     page === 'sales' ? 'Vendas' :
                     page === 'affiliates' ? 'Afiliados' :
                     page === 'revenue' ? 'Receita' :
                     page === 'users' ? 'Usuários' :
                     page === 'subscriptions' ? 'Assinaturas' : page}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
