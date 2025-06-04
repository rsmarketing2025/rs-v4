
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Plus } from 'lucide-react';
import { BMForm } from './BMForm';
import { AdAccountForm } from './AdAccountForm';
import { AdAccountsList } from './AdAccountsList';

interface BusinessManager {
  id: string;
  name: string;
  token: string;
  created_at: string;
  updated_at: string;
}

interface BMListProps {
  refreshTrigger: number;
}

export const BMList: React.FC<BMListProps> = ({ refreshTrigger }) => {
  const [businessManagers, setBusinessManagers] = useState<BusinessManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBM, setEditingBM] = useState<BusinessManager | null>(null);
  const [showAdAccountForm, setShowAdAccountForm] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBusinessManagers();
  }, [refreshTrigger]);

  const fetchBusinessManagers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_managers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinessManagers(data || []);
    } catch (error) {
      console.error('Error fetching business managers:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os Business Managers.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este Business Manager?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('business_managers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Business Manager excluído com sucesso!",
      });

      fetchBusinessManagers();
    } catch (error) {
      console.error('Error deleting BM:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o Business Manager.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Carregando Business Managers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {editingBM && (
        <BMForm
          editingBM={editingBM}
          onClose={() => setEditingBM(null)}
          onBMCreated={() => {
            fetchBusinessManagers();
            setEditingBM(null);
          }}
        />
      )}

      {showAdAccountForm && (
        <AdAccountForm
          businessManagerId={showAdAccountForm}
          onClose={() => setShowAdAccountForm(null)}
          onAdAccountCreated={() => {
            fetchBusinessManagers();
            setShowAdAccountForm(null);
          }}
        />
      )}

      {businessManagers.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Nenhum Business Manager encontrado.</p>
            <p className="text-slate-500 text-sm mt-2">
              Clique em "Novo Business Manager" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {businessManagers.map((bm) => (
            <Card key={bm.id} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">{bm.name}</CardTitle>
                    <p className="text-slate-400 text-sm mt-1">
                      Criado em: {new Date(bm.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAdAccountForm(bm.id)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Conta
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingBM(bm)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(bm.id)}
                      className="border-red-600 text-red-400 hover:bg-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AdAccountsList businessManagerId={bm.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
