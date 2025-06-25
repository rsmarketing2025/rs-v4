
import React, { useState } from 'react';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BookOpen, Bot } from "lucide-react";
import { AgentChat } from "@/components/ai-agents/AgentChat";
import { ConversationHistory } from "@/components/ai-agents/ConversationHistory";
import { TrainingData } from "@/components/ai-agents/TrainingData";

const AIAgents = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <SidebarInset>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-white" />
              <div>
                <h1 className="text-5xl font-bold text-white mb-2">Agentes de IA</h1>
                <p className="text-slate-400 text-lg">Automação inteligente para otimização de campanhas</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <ThemeToggle />
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 backdrop-blur-sm rounded-lg p-6">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Histórico
                </TabsTrigger>
                <TabsTrigger value="training" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Treinamento
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="mt-6">
                <AgentChat 
                  conversationId={selectedConversationId}
                  onConversationChange={setSelectedConversationId}
                />
              </TabsContent>
              
              <TabsContent value="history" className="mt-6">
                <ConversationHistory 
                  onSelectConversation={setSelectedConversationId}
                />
              </TabsContent>
              
              <TabsContent value="training" className="mt-6">
                <TrainingData />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default AIAgents;
