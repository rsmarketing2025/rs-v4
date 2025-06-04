
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdAccountFormProps {
  businessManagerId: string;
  onClose: () => void;
  onAdAccountCreated: () => void;
}

export const AdAccountForm: React.FC<AdAccountFormProps> = ({ 
  businessManagerId,
  onClose, 
  onAdAccountCreated 
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    account_name: '',
    account_id: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('ad_accounts')
        .insert({
          business_manager_id: businessManagerId,
          account_name: formData.account_name,
          account_id: formData.account_id
        });

      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "Conta de anúncios criada com sucesso.",
      });

      onAdAccountCreated();
    } catch (error: any) {
      console.error('Error creating ad account:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar conta de anúncios.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Nova Conta de Anúncios</CardTitle>
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
          <div className="space-y-2">
            <Label htmlFor="account_name" className="text-white">Nome da Conta</Label>
            <Input
              id="account_name"
              type="text"
              value={formData.account_name}
              onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              placeholder="Digite o nome da conta de anúncios"
              required
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_id" className="text-white">ID da Conta</Label>
            <Input
              id="account_id"
              type="text"
              value={formData.account_id}
              onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
              placeholder="Digite o ID da conta de anúncios"
              required
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar'}
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
