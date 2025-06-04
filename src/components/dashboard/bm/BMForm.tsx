
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Trash2 } from 'lucide-react';

interface AdAccount {
  name: string;
  account_id: string;
}

interface BMFormData {
  bm_name: string;
  token: string;
  ad_accounts: AdAccount[];
}

interface BMFormProps {
  onClose: () => void;
  onBMCreated: () => void;
  editingBM?: {
    id: string;
    bm_name: string;
    token: string;
    ad_account_name: string;
    ad_account_id: string;
  };
}

export const BMForm: React.FC<BMFormProps> = ({ onClose, onBMCreated, editingBM }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { register, handleSubmit, control, formState: { errors } } = useForm<BMFormData>({
    defaultValues: editingBM ? {
      bm_name: editingBM.bm_name,
      token: editingBM.token,
      ad_accounts: [{
        name: editingBM.ad_account_name,
        account_id: editingBM.ad_account_id
      }]
    } : {
      bm_name: '',
      token: '',
      ad_accounts: [{ name: '', account_id: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ad_accounts'
  });

  const onSubmit = async (data: BMFormData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um Business Manager.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      if (editingBM) {
        // Update existing BM (only the single row being edited)
        const { error } = await supabase
          .from('business_managers')
          .update({
            bm_name: data.bm_name,
            token: data.token,
            ad_account_name: data.ad_accounts[0].name,
            ad_account_id: data.ad_accounts[0].account_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingBM.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Business Manager atualizado com sucesso!",
        });
      } else {
        // Create new BM entries (one for each ad account)
        const bmEntries = data.ad_accounts.map(account => ({
          bm_name: data.bm_name,
          token: data.token,
          ad_account_name: account.name,
          ad_account_id: account.account_id,
          user_id: user.id,
        }));

        const { error } = await supabase
          .from('business_managers')
          .insert(bmEntries);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Business Manager criado com sucesso!",
        });
      }

      onBMCreated();
      onClose();
    } catch (error) {
      console.error('Error saving BM:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o Business Manager.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">
          {editingBM ? 'Editar' : 'Novo'} Business Manager
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="bm_name" className="text-white">Nome do Business Manager</Label>
            <Input
              id="bm_name"
              {...register('bm_name', { required: 'Nome é obrigatório' })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Digite o nome do BM"
            />
            {errors.bm_name && (
              <p className="text-red-400 text-sm mt-1">{errors.bm_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="token" className="text-white">Token de Acesso</Label>
            <Input
              id="token"
              {...register('token', { required: 'Token é obrigatório' })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Digite o token de acesso"
              type="password"
            />
            {errors.token && (
              <p className="text-red-400 text-sm mt-1">{errors.token.message}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-white">Contas de Anúncio</Label>
              {!editingBM && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: '', account_id: '' })}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar Conta
                </Button>
              )}
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2 p-3 bg-slate-700 rounded-lg mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Conta {index + 1}</span>
                  {!editingBM && fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <div>
                  <Label className="text-slate-300 text-sm">Nome da Conta</Label>
                  <Input
                    {...register(`ad_accounts.${index}.name`, { required: 'Nome da conta é obrigatório' })}
                    className="bg-slate-600 border-slate-500 text-white"
                    placeholder="Digite o nome da conta"
                  />
                  {errors.ad_accounts?.[index]?.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.ad_accounts[index]?.name?.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-slate-300 text-sm">ID da Conta</Label>
                  <Input
                    {...register(`ad_accounts.${index}.account_id`, { required: 'ID da conta é obrigatório' })}
                    className="bg-slate-600 border-slate-500 text-white"
                    placeholder="Digite o ID da conta (ex: act_123456789)"
                  />
                  {errors.ad_accounts?.[index]?.account_id && (
                    <p className="text-red-400 text-xs mt-1">{errors.ad_accounts[index]?.account_id?.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Salvando...' : (editingBM ? 'Atualizar' : 'Criar')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
