
import React, { useState, useEffect } from 'react';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MessageSquare, Settings } from "lucide-react";
import { ConversationHistory } from "@/components/ai-agents/ConversationHistory";
import { AgentChat } from "@/components/ai-agents/AgentChat";
import { AgentTrainingPanel } from "@/components/ai-agents/AgentTrainingPanel";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AIAgents = () => {
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeMainTab, setActiveMainTab] = useState("chat");
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      console.log('Carregando conversas...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('agent_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

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
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    console.log('Conversa selecionada:', conversationId);
    setActiveConversation(conversationId);
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
      const { error: messagesError } = await supabase
        .from('agent_messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) {
        console.error('Erro ao deletar mensagens:', messagesError);
        throw messagesError;
      }

      // Then delete conversation
      const { error: conversationError } = await supabase
        .from('agent_conversations')
        .delete()
        .eq('id', conversationId);

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
        description: "Conversa deletada com sucesso.",
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a conversa.",
        variant: "destructive",
      });
    }
  };

  return (
    <SidebarInset>
      <div className="min-h-screen bg-black">
        {/* Container Principal - Estrutura otimizada */}
        <div className="h-screen flex flex-col">
          {/* Header Principal - Alinhamento centralizado */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-neutral-800 bg-neutral-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white" />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white">Agente de IA - Copy</h1>
                  <p className="text-gray-400 text-sm mt-1">Configuração e treinamento do seu assistente Copy Chief</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* Layout Principal - Grid responsivo otimizado */}
          <div className="flex-1 min-h-0 px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
              {/* Sidebar Esquerda: Histórico de Conversas */}
              <div className="lg:col-span-1 flex flex-col min-h-0">
                <ConversationHistory
                  onSelectConversation={handleConversationSelect}
                  refreshTrigger={refreshTrigger}
                />
              </div>

              {/* Área Principal com Tabs - Container centralizado */}
              <div className="lg:col-span-3 flex flex-col min-h-0">
                <Card className="bg-neutral-950 border-neutral-800 h-full flex flex-col shadow-xl">
                  {/* Header dos Tabs Principais - Padding uniforme */}
                  <CardHeader className="bg-neutral-900/50 border-b border-neutral-800 px-6 py-4 flex-shrink-0">
                    <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-neutral-900 p-1 rounded-lg h-12">
                        <TabsTrigger 
                          value="chat" 
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-neutral-700 data-[state=active]:bg-neutral-700"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Chat
                        </TabsTrigger>
                        <TabsTrigger 
                          value="config" 
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-neutral-700 data-[state=active]:bg-neutral-700"
                        >
                          <Settings className="w-4 h-4" />
                          Configuração
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardHeader>
                  
                  {/* Conteúdo dos Tabs - Sem padding para controle total */}
                  <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                    <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full h-full flex flex-col">
                      {/* Tab do Chat - Altura completa */}
                      <TabsContent value="chat" className="mt-0 h-full flex flex-col overflow-hidden">
                        <AgentChat
                          conversationId={activeConversation}
                          onConversationChange={handleConversationChange}
                        />
                      </TabsContent>

                      {/* Tab de Configuração - Altura completa */}
                      <TabsContent value="config" className="mt-0 h-full flex flex-col overflow-hidden">
                        <AgentTrainingPanel className="h-full" />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default AIAgents;
