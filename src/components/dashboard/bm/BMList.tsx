
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { BMForm } from './BMForm';

interface BusinessManagerEntry {
  id: string;
  bm_name: string;
  token: string;
  ad_account_name: string;
  ad_account_id: string;
  created_at: string;
  updated_at: string;
}

interface BMListProps {
  refreshTrigger: number;
}

export const BMList: React.FC<BMListProps> = ({ refreshTrigger }) => {
  const [bmEntries, setBmEntries] = useState<BusinessManagerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBM, setEditingBM] = useState<BusinessManagerEntry | null>(null);
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
        .order('bm_name', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBmEntries(data || []);
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
    if (!confirm('Tem certeza que deseja excluir esta entrada?')) {
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
        description: "Entrada excluída com sucesso!",
      });

      fetchBusinessManagers();
    } catch (error) {
      console.error('Error deleting BM entry:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a entrada.",
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

      {bmEntries.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <p className="text-slate-400">Nenhum Business Manager encontrado.</p>
            <p className="text-slate-500 text-sm mt-2">
              Clique em "Novo Business Manager" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Business Managers e Contas de Anúncio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Nome do BM</TableHead>
                    <TableHead className="text-slate-300">Nome da Conta</TableHead>
                    <TableHead className="text-slate-300">ID da Conta</TableHead>
                    <TableHead className="text-slate-300">Criado em</TableHead>
                    <TableHead className="text-slate-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bmEntries.map((entry) => (
                    <TableRow key={entry.id} className="border-slate-700">
                      <TableCell className="text-white font-medium">
                        {entry.bm_name}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {entry.ad_account_name}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {entry.ad_account_id}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingBM(entry)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(entry.id)}
                            className="border-red-600 text-red-400 hover:bg-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
