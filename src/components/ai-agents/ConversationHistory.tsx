import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Archive, Trash2, Clock, Eye, EyeOff, Pen, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface Conversation {
  id: string;
  title: string;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
  message_count?: number;
}

interface ConversationHistoryProps {
  onSelectConversation: (id: string) => void;
  refreshTrigger?: number;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  onSelectConversation,
  refreshTrigger = 0
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    conversationId: string;
    conversationTitle: string;
  }>({
    isOpen: false,
    conversationId: '',
    conversationTitle: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, [refreshTrigger]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('Carregando conversas...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado');
        return;
      }

      console.log('Usuário autenticado:', user.id);

      const { data, error } = await supabase
        .from('agent_conversations')
        .select(`
          id,
          title,
          status,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar conversas:', error);
        throw error;
      }

      console.log('Conversas carregadas:', data);

      // Get message counts for each conversation
      const conversationsWithCounts = await Promise.all(
        (data || []).map(async (conv) => {
          try {
            const { count } = await supabase
              .from('agent_messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id);

            return {
              ...conv,
              message_count: count || 0
            };
          } catch (error) {
            console.warn('Erro ao contar mensagens para conversa', conv.id, ':', error);
            return {
              ...conv,
              message_count: 0
            };
          }
        })
      );

      setConversations(conversationsWithCounts);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleArchive = async (conversationId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'archived' : 'active';
      
      const { error } = await supabase
        .from('agent_conversations')
        .update({ status: newStatus })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, status: newStatus as 'active' | 'archived' }
            : conv
        )
      );

      toast({
        title: "Sucesso",
        description: `Conversa ${newStatus === 'archived' ? 'arquivada' : 'desarquivada'} com sucesso.`,
      });
    } catch (error) {
      console.error('Error toggling archive:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status da conversa.",
        variant: "destructive",
      });
    }
  };

  const handleEditTitle = (conversationId: string, currentTitle: string) => {
    setEditingId(conversationId);
    setEditTitleValue(currentTitle);
  };

  const handleSaveTitle = async (conversationId: string) => {
    if (!editTitleValue.trim()) return;

    try {
      const { error } = await supabase
        .from('agent_conversations')
        .update({ title: editTitleValue.trim() })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, title: editTitleValue.trim() }
            : conv
        )
      );

      setEditingId(null);
      setEditTitleValue('');
      
      toast({
        title: "Sucesso",
        description: "Título da conversa atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Error updating title:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o título da conversa.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitleValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, conversationId: string) => {
    if (e.key === 'Enter') {
      handleSaveTitle(conversationId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const openDeleteDialog = (conversationId: string, conversationTitle: string) => {
    setDeleteDialog({
      isOpen: true,
      conversationId,
      conversationTitle
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      conversationId: '',
      conversationTitle: ''
    });
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('agent_conversations')
        .delete()
        .eq('id', deleteDialog.conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.id !== deleteDialog.conversationId));
      
      toast({
        title: "Sucesso",
        description: "Conversa excluída com sucesso.",
      });
      
      closeDeleteDialog();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conversa.",
        variant: "destructive",
      });
    }
  };

  const filteredConversations = conversations.filter(conv => 
    showArchived ? conv.status === 'archived' : conv.status === 'active'
  );

  if (loading) {
    return (
      <Card className="bg-neutral-950 border-neutral-800 h-full">
        <CardContent className="p-6">
          <div className="text-center text-neutral-400">
            Carregando conversas...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-neutral-950 border-neutral-800 h-full flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0 bg-neutral-900 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Histórico de Conversas
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
              className={`border-neutral-600 text-neutral-300 hover:bg-neutral-800 ${
                showArchived ? 'bg-neutral-800' : ''
              }`}
            >
              {showArchived ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Ocultar Arquivadas
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Mostrar Arquivadas
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-4">
          <ScrollArea className="h-full">
            {filteredConversations.length === 0 ? (
              <div className="text-center text-neutral-400 py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  {showArchived 
                    ? "Nenhuma conversa arquivada encontrada." 
                    : "Nenhuma conversa encontrada."
                  }
                </p>
                {!showArchived && <p className="text-sm">Inicie um chat para começar!</p>}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="p-4 bg-neutral-900 border border-neutral-700 rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {editingId === conversation.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={editTitleValue}
                                onChange={(e) => setEditTitleValue(e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, conversation.id)}
                                className="bg-neutral-800 border-neutral-600 text-white text-sm"
                                autoFocus
                              />
                              <Button
                                onClick={() => handleSaveTitle(conversation.id)}
                                size="sm"
                                variant="ghost"
                                className="text-green-400 hover:text-green-300 h-6 w-6 p-0"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={handleCancelEdit}
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-300 h-6 w-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <h3 
                                className="font-medium text-white truncate cursor-pointer hover:text-blue-400 flex-1"
                                onClick={() => onSelectConversation(conversation.id)}
                              >
                                {conversation.title}
                              </h3>
                              <Button
                                onClick={() => handleEditTitle(conversation.id, conversation.title)}
                                size="sm"
                                variant="ghost"
                                className="text-neutral-400 hover:text-white h-6 w-6 p-0"
                                title="Editar título"
                              >
                                <Pen className="w-3 h-3" />
                              </Button>
                              <Badge 
                                variant={conversation.status === 'active' ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {conversation.status === 'active' ? 'Ativa' : 'Arquivada'}
                              </Badge>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-neutral-400">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {conversation.message_count} {conversation.message_count === 1 ? 'mensagem' : 'mensagens'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(conversation.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      {editingId !== conversation.id && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleArchive(conversation.id, conversation.status)}
                            className="text-neutral-400 hover:text-white h-8 w-8 p-0"
                            title={conversation.status === 'active' ? 'Arquivar' : 'Desarquivar'}
                          >
                            <Archive className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(conversation.id, conversation.title)}
                            className="text-neutral-400 hover:text-red-400 h-8 w-8 p-0"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        conversationTitle={deleteDialog.conversationTitle}
      />
    </>
  );
};
