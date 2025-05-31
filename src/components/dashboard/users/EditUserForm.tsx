
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  username: string | null;
  phone: string | null;
  role: 'admin' | 'user';
  pagePermissions: {
    creatives: boolean;
    sales: boolean;
    affiliates: boolean;
    revenue: boolean;
  };
}

interface EditUserFormProps {
  user: UserProfile;
  onClose: () => void;
  onUserUpdated: () => void;
}

export const EditUserForm: React.FC<EditUserFormProps> = ({ user, onClose, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    fullName: user.full_name,
    username: user.username || '',
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    pagePermissions: user.pagePermissions
  });
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // Update profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          username: formData.username || null,
          phone: formData.phone || null
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: formData.role })
        .eq('user_id', user.id);

      if (roleError) throw roleError;

      // Update page permissions
      const pagePermissions = Object.entries(formData.pagePermissions)
        .map(([page, canAccess]) => ({
          user_id: user.id,
          page: page as 'creatives' | 'sales' | 'affiliates' | 'revenue',
          can_access: canAccess
        }));

      // Delete existing permissions and insert new ones
      await supabase
        .from('user_page_permissions')
        .delete()
        .eq('user_id', user.id);

      if (pagePermissions.length > 0) {
        const { error: permissionsError } = await supabase
          .from('user_page_permissions')
          .insert(pagePermissions);

        if (permissionsError) throw permissionsError;
      }

      toast({
        title: "Usuário atualizado com sucesso!",
        description: `${formData.fullName} foi atualizado no sistema.`,
      });

      onUserUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Ocorreu um erro ao atualizar o usuário.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handlePagePermissionChange = (page: keyof typeof formData.pagePermissions, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      pagePermissions: {
        ...prev.pagePermissions,
        [page]: checked
      }
    }));
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">Editar Usuário</CardTitle>
          <CardDescription className="text-slate-400">
            Atualize as informações do usuário
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
                  disabled
                  className="bg-slate-900/50 border-slate-600 text-slate-400"
                />
                <p className="text-xs text-slate-500">O email não pode ser alterado</p>
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
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
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
                      handlePagePermissionChange(page as keyof typeof formData.pagePermissions, checked as boolean)
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

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={updating}
            >
              {updating ? "Atualizando..." : "Atualizar Usuário"}
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
