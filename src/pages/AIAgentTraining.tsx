
import React from 'react';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AgentTrainingArea } from '@/components/ai-agents/training/AgentTrainingArea';

const AIAgentTraining = () => {
  return (
    <SidebarInset>
      <div className="min-h-screen bg-black">
        <div className="container mx-auto p-3 md:p-6 h-screen flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <SidebarTrigger className="text-white" />
            <div className="flex-1">
              <h1 className="text-lg md:text-2xl font-bold text-white">Área de Treinamento do Agente IA</h1>
              <p className="text-gray-400 text-xs md:text-sm">Configure e treine seu AI Agent para fornecer respostas mais precisas</p>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <AgentTrainingArea />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default AIAgentTraining;
