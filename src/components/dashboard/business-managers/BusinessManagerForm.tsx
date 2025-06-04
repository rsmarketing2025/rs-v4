
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface AdAccount {
  id: string;
  ad_account_name: string;
  ad_account_id: string;
}

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
    app_id: '',
    app_secret: ''
  });
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([
    { id: '1', ad_account_name: '', ad_account_id: '' }
  ]);

  useEffect(() => {
    if (editingBM) {
      setFormData({
        bm_name: editingBM.bm_name || '',
        access_token: editingBM.access_token || '',
        app_id: editingBM.app_id || '',
        app_secret: editingBM.app_secret || ''
      });
      setAdAccounts([
        {
          id: '1',
          ad_account_name: editingBM.ad_account_name || '',
          ad_account_id: editingBM.ad_account_id || ''
        }
      ]);
    }
  }, [editingBM]);

  // Função para formatar o nome da BM para ser compatível com automações
  const formatBMName = (name: string): string => {
    return name
      .trim()
      .replace(/\s+/g, '_') // Substitui espaços por underscores
      .replace(/[^\w\-_]/g, '') // Remove caracteres especiais, mantém apenas letras, números, hífens e underscores
      .toLowerCase(); // Converte para minúsculas para consistência
  };

  const addAdAccount = () => {
    const newId = Date.now().toString();
    setAdAccounts([...adAccounts, { id: newId, ad_account_name: '', ad_account_id: '' }]);
  };

  const removeAdAccount = (id: string) => {
    if (adAccounts.length > 1) {
      setAdAccounts(adAccounts.filter(account => account.id !== id));
    }
  };

  const updateAdAccount = (id: string, field: string, value: string) => {
    setAdAccounts(adAccounts.map(account => 
      account.id === id ? { ...account, [field]: value } : account
    ));
  };

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

    // Validar se há pelo menos uma conta de anúncio preenchida
    const validAccounts = adAccounts.filter(account => 
      account.ad_account_name.trim() && account.ad_account_id.trim()
    );

    if (validAccounts.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma conta de anúncio válida",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Formatar o nome da BM para ser compatível com automações
      const formattedBMName = formatBMName(formData.bm_name);
      
      // Mostrar um aviso se o nome foi alterado
      if (formattedBMName !== formData.bm_name) {
        toast({
          title: "Nome formatado",
          description: `Nome da BM formatado de "${formData.bm_name}" para "${formattedBMName}" para compatibilidade com automações`,
        });
      }

      if (editingBM) {
        // Update existing record
        const { error } = await supabase
          .from('business_managers')
          .update({
            bm_name: formattedBMName,
            access_token: formData.access_token,
            app_id: formData.app_id,
            app_secret: formData.app_secret,
            ad_account_name: validAccounts[0].ad_account_name,
            ad_account_id: validAccounts[0].ad_account_id
          })
          .eq('id', editingBM.id);

        if (error) throw error;

        // Se há mais de uma conta de anúncio, criar registros adicionais
        if (validAccounts.length > 1) {
          const additionalAccounts = validAccounts.slice(1).map(account => ({
            user_id: user.id,
            bm_name: formattedBMName,
            access_token: formData.access_token,
            app_id: formData.app_id,
            app_secret: formData.app_secret,
            ad_account_name: account.ad_account_name,
            ad_account_id: account.ad_account_id
          }));

          const { error: insertError } = await supabase
            .from('business_managers')
            .insert(additionalAccounts);

          if (insertError) throw insertError;
        }

        toast({
          title: "Sucesso",
          description: "Business Manager atualizado com sucesso!"
        });
      } else {
        // Create new records - one for each ad account
        const recordsToInsert = validAccounts.map(account => ({
          user_id: user.id,
          bm_name: formattedBMName,
          access_token: formData.access_token,
          app_id: formData.app_id,
          app_secret: formData.app_secret,
          ad_account_name: account.ad_account_name,
          ad_account_id: account.ad_account_id
        }));

        const { error } = await supabase
          .from('business_managers')
          .insert(recordsToInsert);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: `Business Manager criado com ${validAccounts.length} conta(s) de anúncio!`
        });
      }

      onBusinessManagerCreated();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar Business Manager",
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
          {editingBM ? 'Editar Business Manager' : 'Novo Business Manager'}
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Manager Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Informações do Business Manager</h3>
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
                <p className="text-xs text-slate-400">
                  Espaços serão automaticamente convertidos para underscore (_) para compatibilidade com automações
                </p>
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

              <div className="space-y-2">
                <Label htmlFor="app_id" className="text-white">ID do Aplicativo</Label>
                <Input
                  id="app_id"
                  type="text"
                  value={formData.app_id}
                  onChange={(e) => setFormData({ ...formData, app_id: e.target.value })}
                  placeholder="Ex: 123456789012345"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="app_secret" className="text-white">Chave Secreta</Label>
                <Input
                  id="app_secret"
                  type="password"
                  value={formData.app_secret}
                  onChange={(e) => setFormData({ ...formData, app_secret: e.target.value })}
                  placeholder="Insira a chave secreta"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
          </div>

          {/* Ad Accounts Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Contas de Anúncio</h3>
              <Button
                type="button"
                onClick={addAdAccount}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Conta
              </Button>
            </div>

            {adAccounts.map((account, index) => (
              <Card key={account.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-slate-300">
                      Conta de Anúncio #{index + 1}
                    </h4>
                    {adAccounts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAdAccount(account.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Nome da Conta de Anúncio</Label>
                      <Input
                        type="text"
                        value={account.ad_account_name}
                        onChange={(e) => updateAdAccount(account.id, 'ad_account_name', e.target.value)}
                        placeholder="Ex: Conta Principal"
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white">ID da Conta de Anúncio</Label>
                      <Input
                        type="text"
                        value={account.ad_account_id}
                        onChange={(e) => updateAdAccount(account.id, 'ad_account_id', e.target.value)}
                        placeholder="Ex: act_123456789"
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
