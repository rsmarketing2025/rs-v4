
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { BusinessManagerForm } from './BusinessManagerForm';
import { BusinessManagerFilter } from './BusinessManagerFilter';

interface BusinessManager {
  id: string;
  bm_name: string;
  access_token: string;
  ad_account_name: string;
  ad_account_id: string;
  created_at: string;
  updated_at: string;
  app_id?: string;
  app_secret?: string;
}

interface BusinessManagerListProps {
  refreshTrigger: number;
}

export const BusinessManagerList: React.FC<BusinessManagerListProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [businessManagers, setBusinessManagers] = useState<BusinessManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBM, setEditingBM] = useState<BusinessManager | null>(null);
  const [showTokens, setShowTokens] = useState<{ [key: string]: boolean }>({});
  const [selectedBMs, setSelectedBMs] = useState<string[]>([]);

  // Function to truncate text if it exceeds 10 characters
  const truncateText = (text: string, maxLength: number = 10) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const fetchBusinessManagers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('business_manager_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBusinessManagers(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar Business Managers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessManagers();
  }, [user, refreshTrigger]);

  // Filter business managers based on selected filters
  const filteredBusinessManagers = businessManagers.filter(bm => {
    if (selectedBMs.length === 0) return true;
    return selectedBMs.includes(bm.bm_name);
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta de anúncio?')) return;

    try {
      const { error } = await supabase
        .from('business_manager_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta de anúncio excluída com sucesso!"
      });

      fetchBusinessManagers();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir conta de anúncio",
        variant: "destructive"
      });
    }
  };

  const toggleTokenVisibility = (id: string) => {
    setShowTokens(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const maskToken = (token: string) => {
    if (token.length <= 8) return '*'.repeat(token.length);
    return token.substring(0, 4) + '*'.repeat(token.length - 8) + token.substring(token.length - 4);
  };

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6">
          <div className="text-center text-slate-400">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {editingBM && (
        <BusinessManagerForm
          editingBM={editingBM}
          onClose={() => setEditingBM(null)}
          onBusinessManagerCreated={fetchBusinessManagers}
        />
      )}

      {/* Filter Section */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-medium text-white">Filtros</h3>
            <BusinessManagerFilter
              businessManagers={businessManagers}
              selectedBMs={selectedBMs}
              onFilterChange={setSelectedBMs}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6">
          {filteredBusinessManagers.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              {businessManagers.length === 0 ? (
                <>
                  <p className="mb-2">Nenhuma conta de anúncio encontrada</p>
                  <p className="text-sm">Adicione sua primeira conta para começar</p>
                </>
              ) : (
                <>
                  <p className="mb-2">Nenhuma conta encontrada com os filtros aplicados</p>
                  <p className="text-sm">Ajuste os filtros para ver mais resultados</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Business Manager</TableHead>
                    <TableHead className="text-slate-300">Conta de Anúncio</TableHead>
                    <TableHead className="text-slate-300">ID da Conta</TableHead>
                    <TableHead className="text-slate-300">Token de Acesso</TableHead>
                    <TableHead className="text-slate-300">Data de Criação</TableHead>
                    <TableHead className="text-slate-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinessManagers.map((bm) => (
                    <TableRow key={bm.id} className="border-slate-700">
                      <TableCell className="text-white font-medium" title={bm.bm_name}>
                        {truncateText(bm.bm_name)}
                      </TableCell>
                      <TableCell className="text-slate-300" title={bm.ad_account_name}>
                        {truncateText(bm.ad_account_name)}
                      </TableCell>
                      <TableCell className="text-slate-300 font-mono text-sm" title={bm.ad_account_id}>
                        {truncateText(bm.ad_account_id)}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm" title={showTokens[bm.id] ? bm.access_token : maskToken(bm.access_token)}>
                            {showTokens[bm.id] ? truncateText(bm.access_token, 15) : truncateText(maskToken(bm.access_token), 15)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTokenVisibility(bm.id)}
                            className="text-slate-400 hover:text-white h-6 w-6 p-0"
                          >
                            {showTokens[bm.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {new Date(bm.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingBM(bm)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(bm.id)}
                            className="text-red-400 hover:text-red-300"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};
