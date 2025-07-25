import React from 'react';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { InvisibleStructureTab } from '@/components/ai-agents/config-tabs/InvisibleStructureTab';

const AIAgentInvisibleStructure = () => {
  return (
    <SidebarInset>
      <div className="min-h-screen bg-black">
        <div className="container mx-auto p-3 md:p-6 h-screen flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <SidebarTrigger className="text-white" />
            <div className="flex-1">
              <h1 className="text-lg md:text-2xl font-bold text-white">Estrutura Invisível - Agente IA</h1>
              <p className="text-gray-400 text-xs md:text-sm">Configure materiais e prompts para estrutura invisível de conteúdo</p>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <InvisibleStructureTab />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default AIAgentInvisibleStructure;