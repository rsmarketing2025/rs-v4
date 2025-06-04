
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Save } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface BusinessManagerFormProps {
  onClose: () => void;
  onBusinessManagerCreated: () => void;
  editingBM?: any;
}

export const BusinessManagerForm: React.FC<BusinessManagerFormProps> = ({
  onClose,
  onBusinessManagerCreated,
  editingBM
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bm_name: '',
    access_token: '',
    ad_account_name: '',
    ad_account_id: ''
  });

  useEffect(() => {
    if (editingBM) {
      setFormData({
        bm_name: editingBM.bm_name || '',
        access_token: editingBM.access_token || '',
        ad_account_name: editingBM.ad_account_name || '',
        ad_account_id: editingBM.ad_account_id || ''
      });
    }
  }, [editingBM]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (editingBM) {
        // Update existing record
        const { error } = await supabase
          .from('business_managers')
          .update({
            bm_name: formData.bm_name,
            access_token: formData.access_token,
            ad_account_name: formData.ad_account_name,
            ad_account_id: formData.ad_account_id
          })
          .eq('id', editingBM.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Conta de anúncio atualizada com sucesso!"
        });
      } else {
        // Create new record
        const { error } = await supabase
          .from('business_managers')
          .insert({
            user_id: user.id,
            bm_name: formData.bm_name,
            access_token: formData.access_token,
            ad_account_name: formData.ad_account_name,
            ad_account_id: formData.ad_account_id
          });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Conta de anúncio adicionada com sucesso!"
        });
      }

      onBusinessManagerCreated();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar conta de anúncio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-white">
          {editingBM ? 'Editar Conta de Anúncio' : 'Nova Conta de Anúncio'}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bm_name" className="text-white">Nome do Business Manager</Label>
              <Input
                id="bm_name"
                type="text"
                value={formData.bm_name}
                onChange={(e) => setFormData({ ...formData, bm_name: e.target.value })}
                placeholder="Ex: Minha Empresa BM"
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="access_token" className="text-white">Token de Acesso</Label>
              <Input
                id="access_token"
                type="password"
                value={formData.access_token}
                onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                placeholder="Insira o token de acesso"
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ad_account_name" className="text-white">Nome da Conta de Anúncio</Label>
              <Input
                id="ad_account_name"
                type="text"
                value={formData.ad_account_name}
                onChange={(e) => setFormData({ ...formData, ad_account_name: e.target.value })}
                placeholder="Ex: Conta Principal"
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ad_account_id" className="text-white">ID da Conta de Anúncio</Label>
              <Input
                id="ad_account_id"
                type="text"
                value={formData.ad_account_id}
                onChange={(e) => setFormData({ ...formData, ad_account_id: e.target.value })}
                placeholder="Ex: act_123456789"
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-slate-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : (editingBM ? 'Atualizar' : 'Salvar')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
