
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { BusinessManagerForm } from "./BusinessManagerForm";
import { AdAccountForm } from "./AdAccountForm";

interface BusinessManager {
  id: string;
  name: string;
  access_token: string;
  created_at: string;
  ad_accounts?: AdAccount[];
}

interface AdAccount {
  id: string;
  business_manager_id: string;
  account_name: string;
  account_id: string;
  created_at: string;
}

interface BusinessManagerListProps {
  refreshTrigger: number;
}

export const BusinessManagerList: React.FC<BusinessManagerListProps> = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [businessManagers, setBusinessManagers] = useState<BusinessManager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingBm, setEditingBm] = useState<BusinessManager | null>(null);
  const [showAdAccountForm, setShowAdAccountForm] = useState<string | null>(null);
  const [expandedBms, setExpandedBms] = useState<Set<string>>(new Set());

  const fetchBusinessManagers = async () => {
    if (!user) return;

    try {
      // Fetch business managers
      const { data: bms, error: bmError } = await supabase
        .from('business_managers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bmError) throw bmError;

      // Fetch ad accounts for each business manager
      const bmsWithAccounts = await Promise.all(
        (bms || []).map(async (bm) => {
          const { data: accounts, error: accountsError } = await supabase
            .from('ad_accounts')
            .select('*')
            .eq('business_manager_id', bm.id)
            .order('created_at', { ascending: false });

          if (accountsError) {
            console.error('Error fetching ad accounts:', accountsError);
            return { ...bm, ad_accounts: [] };
          }

          return { ...bm, ad_accounts: accounts || [] };
        })
      );

      setBusinessManagers(bmsWithAccounts);
    } catch (error: any) {
      console.error('Error fetching business managers:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar Business Managers.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (bmId: string) => {
    if (!confirm('Tem certeza que deseja excluir este Business Manager? Todas as contas de anúncios associadas também serão excluídas.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('business_managers')
        .delete()
        .eq('id', bmId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Business Manager excluído com sucesso.",
      });

      fetchBusinessManagers();
    } catch (error: any) {
      console.error('Error deleting business manager:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir Business Manager.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAdAccount = async (accountId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta de anúncios?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ad_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Conta de anúncios excluída com sucesso.",
      });

      fetchBusinessManagers();
    } catch (error: any) {
      console.error('Error deleting ad account:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir conta de anúncios.",
        variant: "destructive",
      });
    }
  };

  const toggleExpanded = (bmId: string) => {
    const newExpanded = new Set(expandedBms);
    if (newExpanded.has(bmId)) {
      newExpanded.delete(bmId);
    } else {
      newExpanded.add(bmId);
    }
    setExpandedBms(newExpanded);
  };

  useEffect(() => {
    fetchBusinessManagers();
  }, [user, refreshTrigger]);

  const handleBmUpdated = () => {
    setEditingBm(null);
    fetchBusinessManagers();
  };

  const handleAdAccountCreated = () => {
    setShowAdAccountForm(null);
    fetchBusinessManagers();
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="text-center text-slate-400">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {editingBm && (
        <BusinessManagerForm
          editingBm={editingBm}
          onClose={() => setEditingBm(null)}
          onBmCreated={handleBmUpdated}
        />
      )}

      {showAdAccountForm && (
        <AdAccountForm
          businessManagerId={showAdAccountForm}
          onClose={() => setShowAdAccountForm(null)}
          onAdAccountCreated={handleAdAccountCreated}
        />
      )}

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Business Managers ({businessManagers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {businessManagers.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Nenhum Business Manager cadastrado ainda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300"></TableHead>
                  <TableHead className="text-slate-300">Nome</TableHead>
                  <TableHead className="text-slate-300">Contas</TableHead>
                  <TableHead className="text-slate-300">Criado em</TableHead>
                  <TableHead className="text-slate-300">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businessManagers.map((bm) => (
                  <React.Fragment key={bm.id}>
                    <TableRow className="border-slate-700">
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(bm.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {expandedBms.has(bm.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-white font-medium">{bm.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-slate-300 border-slate-600">
                          {bm.ad_accounts?.length || 0} contas
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {new Date(bm.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAdAccountForm(bm.id)}
                            className="text-green-400 hover:text-green-300"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingBm(bm)}
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
                    {expandedBms.has(bm.id) && bm.ad_accounts && bm.ad_accounts.length > 0 && (
                      bm.ad_accounts.map((account) => (
                        <TableRow key={account.id} className="border-slate-700 bg-slate-900/30">
                          <TableCell></TableCell>
                          <TableCell className="text-slate-300 pl-8">
                            └ {account.account_name}
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm">
                            ID: {account.account_id}
                          </TableCell>
                          <TableCell className="text-slate-400">
                            {new Date(account.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAdAccount(account.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
