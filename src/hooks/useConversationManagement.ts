
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useConversationManagement = (conversationId: string | null) => {
  const [conversationTitle, setConversationTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (conversationId) {
      loadConversationTitle();
    } else {
      setConversationTitle('');
    }
  }, [conversationId]);

  const loadConversationTitle = async () => {
    if (!conversationId) return;
    try {
      const { data, error } = await supabase
        .from('agent_conversations')
        .select('title')
        .eq('id', conversationId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setConversationTitle(data.title);
      }
    } catch (error) {
      console.error('Error loading conversation title:', error);
    }
  };

  const updateConversationTitle = async (newTitle: string) => {
    if (!conversationId || !newTitle.trim()) return false;
    try {
      const { error } = await supabase
        .from('agent_conversations')
        .update({ title: newTitle.trim() })
        .eq('id', conversationId);

      if (error) throw error;
      setConversationTitle(newTitle.trim());
      toast({
        title: "Sucesso",
        description: "Título da conversa atualizado com sucesso."
      });
      return true;
    } catch (error) {
      console.error('Error updating title:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o título da conversa.",
        variant: "destructive"
      });
      return false;
    }
  };

  const createNewConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      console.log('Criando nova conversa para usuário:', user.id);
      const { data, error } = await supabase
        .from('agent_conversations')
        .insert({
          user_id: user.id,
          title: 'Nova Conversa'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar conversa:', error);
        throw error;
      }
      console.log('Nova conversa criada:', data);
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar uma nova conversa.",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    conversationTitle,
    isEditingTitle,
    setIsEditingTitle,
    updateConversationTitle,
    createNewConversation
  };
};
