import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { UserWithPermissions } from './types';

export interface UserFormProps {
  user?: UserWithPermissions;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: () => void;
}

const PAGES = [
  { id: 'creatives', label: 'Criativos' },
  { id: 'sales', label: 'Vendas' },
  { id: 'affiliates', label: 'Afiliados' },
  { id: 'revenue', label: 'Receita' },
  { id: 'users', label: 'Usuários' },
  { id: 'business-managers', label: 'Business Managers' },
  { id: 'subscriptions', label: 'Assinaturas' }
];

export const UserForm: React.FC<UserFormProps> = ({ user, isOpen, onClose, onUserUpdate }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'admin' | 'user' | 'business_manager'>('user');
  const [permissions, setPermissions] = useState<{ page: string; can_access: boolean; }[]>([]);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setUsername(user.username || '');
      setRole(user.role);
      setPermissions(user.user_page_permissions.map(p => ({ page: p.page, can_access: p.can_access })));
    } else {
      // Reset form when creating a new user
      setFullName('');
      setEmail('');
      setUsername('');
      setRole('user');
      setPermissions(PAGES.map(p => ({ page: p.id, can_access: false })));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userPermissions = PAGES.map(page => {
      const permission = permissions.find(p => p.page === page.id);
      return { page: page.id, can_access: permission?.can_access || false };
    });

    try {
      if (user) {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            username: username
          })
          .eq('id', user.id);

        if (error) {
          throw new Error(error.message);
        }

        // Update user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: role })
          .eq('user_id', user.id);

        if (roleError) {
          throw new Error(roleError.message);
        }

        // Update user permissions
        await Promise.all(
          userPermissions.map(async (permission) => {
            const { data, error } = await supabase
              .from('user_page_permissions')
              .update({ can_access: permission.can_access })
              .eq('user_id', user.id)
              .eq('page', permission.page);

            if (error) {
              throw new Error(error.message);
            }
          })
        );

        toast({
          title: "Usuário atualizado!",
          description: "As informações do usuário foram atualizadas com sucesso.",
        });
      } else {
        // Create new user
        const { data: newUser, error } = await supabase.auth.signUp({
          email: email,
          password: 'defaultpassword', // You should implement a proper password reset flow
          options: {
            data: {
              full_name: fullName,
              username: username,
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (newUser.user) {
          // Assign role to new user
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: newUser.user.id, role: role });

          if (roleError) {
            throw new Error(roleError.message);
          }

          // Set user permissions
          await Promise.all(
            userPermissions.map(async (permission) => {
              const { error } = await supabase
                .from('user_page_permissions')
                .insert({ user_id: newUser.user.id, page: permission.page, can_access: permission.can_access });

              if (error) {
                throw new Error(error.message);
              }
            })
          );

          toast({
            title: "Usuário criado!",
            description: "Um novo usuário foi criado com sucesso.",
          });
        }
      }

      onClose();
      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!user} // Disable email editing for existing users
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Função</Label>
            <Select value={role} onValueChange={(value) => setRole(value as 'admin' | 'user' | 'business_manager')}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecione uma função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="business_manager">Business Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Permissões de Página</Label>
            <div className="grid gap-2 mt-2">
              {PAGES.map(page => (
                <div key={page.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={page.id}
                    checked={permissions.find(p => p.page === page.id)?.can_access || false}
                    onCheckedChange={(checked) => {
                      setPermissions(prev => {
                        const newPermissions = [...prev];
                        const permissionIndex = newPermissions.findIndex(p => p.page === page.id);
                        if (permissionIndex !== -1) {
                          newPermissions[permissionIndex] = { ...newPermissions[permissionIndex], can_access: checked || false };
                        } else {
                          newPermissions.push({ page: page.id, can_access: checked || false });
                        }
                        return newPermissions;
                      });
                    }}
                  />
                  <Label htmlFor={page.id}>{page.label}</Label>
                </div>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
