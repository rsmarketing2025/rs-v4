
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { AdAccountForm } from './AdAccountForm';

interface AdAccount {
  id: string;
  name: string;
  account_id: string;
  created_at: string;
}

interface AdAccountsListProps {
  businessManagerId: string;
}

export const AdAccountsList: React.FC<AdAccountsListProps> = ({ businessManagerId }) => {
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAdAccount, setEditingAdAccount] = useState<AdAccount | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdAccounts();
  }, [businessManagerId]);

  const fetchAdAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ad_accounts')
        .select('*')
        .eq('business_manager_id', businessManagerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdAccounts(data || []);
    } catch (error) {
      console.error('Error fetching ad accounts:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as contas de anúncio.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta de anúncio?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ad_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta de anúncio excluída com sucesso!",
      });

      fetchAdAccounts();
    } catch (error) {
      console.error('Error deleting ad account:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conta de anúncio.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-slate-400 text-sm">Carregando contas...</div>;
  }

  return (
    <div className="space-y-4">
      {editingAdAccount && (
        <AdAccountForm
          businessManagerId={businessManagerId}
          editingAdAccount={editingAdAccount}
          onClose={() => setEditingAdAccount(null)}
          onAdAccountCreated={() => {
            fetchAdAccounts();
            setEditingAdAccount(null);
          }}
        />
      )}

      {adAccounts.length === 0 ? (
        <p className="text-slate-500 text-sm">
          Nenhuma conta de anúncio cadastrada.
        </p>
      ) : (
        <div className="space-y-2">
          <h4 className="text-white font-medium text-sm">Contas de Anúncio:</h4>
          {adAccounts.map((account) => (
            <div 
              key={account.id} 
              className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
            >
              <div>
                <p className="text-white font-medium">{account.name}</p>
                <p className="text-slate-400 text-sm">{account.account_id}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingAdAccount(account)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(account.id)}
                  className="border-red-600 text-red-400 hover:bg-red-900"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
