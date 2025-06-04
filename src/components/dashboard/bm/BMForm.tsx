
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface BMFormData {
  name: string;
  token: string;
}

interface BMFormProps {
  onClose: () => void;
  onBMCreated: () => void;
  editingBM?: {
    id: string;
    name: string;
    token: string;
  };
}

export const BMForm: React.FC<BMFormProps> = ({ onClose, onBMCreated, editingBM }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors } } = useForm<BMFormData>({
    defaultValues: editingBM ? {
      name: editingBM.name,
      token: editingBM.token
    } : undefined
  });

  const onSubmit = async (data: BMFormData) => {
    try {
      setLoading(true);

      if (editingBM) {
        // Update existing BM
        const { error } = await supabase
          .from('business_managers')
          .update({
            name: data.name,
            token: data.token,
          })
          .eq('id', editingBM.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Business Manager atualizado com sucesso!",
        });
      } else {
        // Create new BM
        const { error } = await supabase
          .from('business_managers')
          .insert({
            name: data.name,
            token: data.token,
          });

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
            <Label htmlFor="name" className="text-white">Nome do Business Manager</Label>
            <Input
              id="name"
              {...register('name', { required: 'Nome é obrigatório' })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Digite o nome do BM"
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
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
