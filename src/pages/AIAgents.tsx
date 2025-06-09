
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Bot, Clock } from "lucide-react";

const AIAgents = () => {
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

          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm max-w-lg w-full">
              <CardContent className="p-12 text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Bot className="w-24 h-24 text-blue-400" />
                    <Clock className="w-8 h-8 text-orange-400 absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Em Breve</h2>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Nossos agentes de IA inteligentes estão sendo desenvolvidos para automatizar e otimizar suas campanhas de marketing digital.
                </p>
                <div className="mt-8 p-4 bg-blue-950/30 border border-blue-800/30 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    🚀 Funcionalidades que virão: análise automática de criativos, otimização de budget e sugestões de targeting
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default AIAgents;
