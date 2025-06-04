
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface AdAccountFormData {
  name: string;
  account_id: string;
}

interface AdAccountFormProps {
  businessManagerId: string;
  onClose: () => void;
  onAdAccountCreated: () => void;
  editingAdAccount?: {
    id: string;
    name: string;
    account_id: string;
  };
}

export const AdAccountForm: React.FC<AdAccountFormProps> = ({ 
  businessManagerId, 
  onClose, 
  onAdAccountCreated, 
  editingAdAccount 
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors } } = useForm<AdAccountFormData>({
    defaultValues: editingAdAccount ? {
      name: editingAdAccount.name,
      account_id: editingAdAccount.account_id
    } : undefined
  });

  const onSubmit = async (data: AdAccountFormData) => {
    try {
      setLoading(true);

      if (editingAdAccount) {
        // Update existing ad account
        const { error } = await supabase
          .from('ad_accounts')
          .update({
            name: data.name,
            account_id: data.account_id,
          })
          .eq('id', editingAdAccount.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Conta de anúncio atualizada com sucesso!",
        });
      } else {
        // Create new ad account
        const { error } = await supabase
          .from('ad_accounts')
          .insert({
            business_manager_id: businessManagerId,
            name: data.name,
            account_id: data.account_id,
          });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Conta de anúncio criada com sucesso!",
        });
      }

      onAdAccountCreated();
      onClose();
    } catch (error) {
      console.error('Error saving ad account:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a conta de anúncio.",
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
          {editingAdAccount ? 'Editar' : 'Nova'} Conta de Anúncio
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
            <Label htmlFor="name" className="text-white">Nome da Conta</Label>
            <Input
              id="name"
              {...register('name', { required: 'Nome é obrigatório' })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Digite o nome da conta"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="account_id" className="text-white">ID da Conta</Label>
            <Input
              id="account_id"
              {...register('account_id', { required: 'ID da conta é obrigatório' })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Digite o ID da conta (ex: act_123456789)"
            />
            {errors.account_id && (
              <p className="text-red-400 text-sm mt-1">{errors.account_id.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Salvando...' : (editingAdAccount ? 'Atualizar' : 'Criar')}
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
