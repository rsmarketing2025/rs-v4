import React, { useState, useEffect } from 'react';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Settings } from "lucide-react";
import { ConversationHistory } from "@/components/ai-agents/ConversationHistory";
import { AgentChat } from "@/components/ai-agents/AgentChat";
import { AgentConfigArea } from "@/components/ai-agents/AgentConfigArea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
type ActiveView = 'chat' | 'config';
const AIAgents = () => {
  const [activeView, setActiveView] = useState<ActiveView>('chat');
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadConversations();
  }, []);
  const loadConversations = async () => {
    try {
      console.log('Carregando conversas...');
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não autenticado');
        return;
      }
      const {
        data,
        error
      } = await supabase.from('agent_conversations').select('*').eq('user_id', user.id).order('updated_at', {
        ascending: false
      });
      if (error) {
        console.error('Erro ao carregar conversas:', error);
        throw error;
      }
      console.log('Conversas carregadas:', data);
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleConversationSelect = (conversationId: string) => {
    console.log('Conversa selecionada:', conversationId);
    setActiveConversation(conversationId);
    setActiveView('chat'); // Automaticamente volta para o chat ao selecionar uma conversa
  };
  const handleConversationChange = (conversationId: string) => {
    console.log('Conversa alterada/criada:', conversationId);
    setActiveConversation(conversationId);
    setRefreshTrigger(prev => prev + 1);
  };
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      console.log('Deletando conversa:', conversationId);

      // Delete messages first
      const {
        error: messagesError
      } = await supabase.from('agent_messages').delete().eq('conversation_id', conversationId);
      if (messagesError) {
        console.error('Erro ao deletar mensagens:', messagesError);
        throw messagesError;
      }

      // Then delete conversation
      const {
        error: conversationError
      } = await supabase.from('agent_conversations').delete().eq('id', conversationId);
      if (conversationError) {
        console.error('Erro ao deletar conversa:', conversationError);
        throw conversationError;
      }
      console.log('Conversa deletada com sucesso');

      // If this was the active conversation, clear it
      if (activeConversation === conversationId) {
        setActiveConversation(null);
      }

      // Reload conversations
      setRefreshTrigger(prev => prev + 1);
      toast({
        title: "Sucesso",
        description: "Conversa deletada com sucesso."
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a conversa.",
        variant: "destructive"
      });
    }
  };
  return <SidebarInset>
      <div className="min-h-screen bg-slate-900">
        <div className="container mx-auto p-3 md:p-6 h-screen flex flex-col">
          <div className="flex flex-col space-y-2 mb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-white" />
              <div className="flex-1">
                <h1 className="text-lg md:text-2xl font-bold text-white">Agente de IA - Copy</h1>
                <p className="text-gray-400 text-xs md:text-sm">Chat inteligente com seu assistente Copy Chief</p>
              </div>
            </div>
            <div className="flex justify-end">
              <ThemeToggle />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
            {/* Conversation History - Left Sidebar */}
            <div className="lg:col-span-1 flex flex-col min-h-0">
              <ConversationHistory onSelectConversation={handleConversationSelect} refreshTrigger={refreshTrigger} />
            </div>

            {/* Main Content Area with Tabs */}
            <div className="lg:col-span-3 flex flex-col min-h-0">
              {/* Main Navigation Tabs */}
              <div className="mb-6">
                <div className="flex space-x-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                  <Button onClick={() => setActiveView('chat')} variant={activeView === 'chat' ? 'default' : 'ghost'} className={`flex-1 flex items-center gap-2 text-sm font-medium transition-all ${activeView === 'chat' ? 'bg-neutral-950 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}>
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </Button>
                  <Button onClick={() => setActiveView('config')} variant={activeView === 'config' ? 'default' : 'ghost'} className={`flex-1 flex items-center gap-2 text-sm font-medium transition-all ${activeView === 'config' ? 'bg-neutral-950 text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}>
                    <Settings className="w-4 h-4" />
                    Configuração do Agente
                  </Button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 min-h-0">
                {activeView === 'chat' ? <AgentChat conversationId={activeConversation} onConversationChange={handleConversationChange} /> : <div className="h-full">
                    <AgentConfigArea />
                  </div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>;
};
export default AIAgents;