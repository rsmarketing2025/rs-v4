
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface BusinessManagerFormProps {
  onClose: () => void;
  onBmCreated: () => void;
  editingBm?: any;
}

export const BusinessManagerForm: React.FC<BusinessManagerFormProps> = ({ 
  onClose, 
  onBmCreated,
  editingBm 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: editingBm?.name || '',
    access_token: editingBm?.access_token || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      if (editingBm) {
        // Update existing BM
        const { error } = await supabase
          .from('business_managers')
          .update({
            name: formData.name,
            access_token: formData.access_token
          })
          .eq('id', editingBm.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso!",
          description: "Business Manager atualizado com sucesso.",
        });
      } else {
        // Create new BM
        const { error } = await supabase
          .from('business_managers')
          .insert({
            user_id: user.id,
            name: formData.name,
            access_token: formData.access_token
          });

        if (error) throw error;
        
        toast({
          title: "Sucesso!",
          description: "Business Manager criado com sucesso.",
        });
      }

      onBmCreated();
    } catch (error: any) {
      console.error('Error saving business manager:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar Business Manager.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">
          {editingBm ? 'Editar Business Manager' : 'Novo Business Manager'}
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
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Nome do Business Manager</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Digite o nome do Business Manager"
              required
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token" className="text-white">Access Token</Label>
            <Input
              id="access_token"
              type="password"
              value={formData.access_token}
              onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
              placeholder="Digite o access token do Facebook"
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
