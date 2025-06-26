
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Download, MessageSquare, Clock, Star, AlertCircle } from "lucide-react";

interface MonitoringTabProps {
  data: {
    conversationHistory: any[];
    logs: any[];
    reports: any[];
    userFeedback: any[];
  };
  onChange: (data: any) => void;
}

export const MonitoringTab: React.FC<MonitoringTabProps> = ({ data }) => {
  // Dados fictícios para demonstração
  const mockConversations = [
    { id: 1, user: "Usuário 1", date: "2024-01-15", messages: 12, status: "finalizada" },
    { id: 2, user: "Usuário 2", date: "2024-01-14", messages: 8, status: "ativa" },
    { id: 3, user: "Usuário 3", date: "2024-01-13", messages: 15, status: "escalada" }
  ];

  const mockLogs = [
    { id: 1, type: "info", message: "Agente iniciado com sucesso", timestamp: "2024-01-15 10:30:00" },
    { id: 2, type: "warning", message: "Resposta demorou mais que 5s", timestamp: "2024-01-15 10:28:15" },
    { id: 3, type: "error", message: "Falha ao processar arquivo PDF", timestamp: "2024-01-15 10:25:30" }
  ];

  const mockFeedback = [
    { id: 1, rating: 5, comment: "Excelente atendimento!", user: "Usuário 1", date: "2024-01-15" },
    { id: 2, rating: 4, comment: "Bom, mas poderia ser mais rápido", user: "Usuário 2", date: "2024-01-14" },
    { id: 3, rating: 3, comment: "Resposta adequada", user: "Usuário 3", date: "2024-01-13" }
  ];

  const mockReports = {
    totalConversations: 45,
    avgResponseTime: "2.3s",
    satisfactionRate: "87%",
    escalationRate: "12%"
  };

  const exportLogs = () => {
    console.log('Exportando logs... (funcionalidade preparada para integração)');
    // Preparado para integração futura com backend
  };

  const exportConversations = () => {
    console.log('Exportando conversas... (funcionalidade preparada para integração)');
    // Preparado para integração futura com backend
  };

  return (
    <div className="space-y-6">
      {/* Relatórios de Uso */}
      <div className="space-y-3">
        <Label className="text-neutral-200 text-sm font-medium">
          Relatórios de Uso
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-neutral-900 rounded p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{mockReports.totalConversations}</p>
            <p className="text-xs text-neutral-400">Total de Conversas</p>
          </div>
          <div className="bg-neutral-900 rounded p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{mockReports.avgResponseTime}</p>
            <p className="text-xs text-neutral-400">Tempo Médio</p>
          </div>
          <div className="bg-neutral-900 rounded p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{mockReports.satisfactionRate}</p>
            <p className="text-xs text-neutral-400">Satisfação</p>
          </div>
          <div className="bg-neutral-900 rounded p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{mockReports.escalationRate}</p>
            <p className="text-xs text-neutral-400">Escalação</p>
          </div>
        </div>
      </div>

      {/* Histórico de Conversas */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-neutral-200 text-sm font-medium">
            Histórico de Conversas do Agente
          </Label>
          <Button
            onClick={exportConversations}
            variant="outline"
            size="sm"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
        <div className="bg-neutral-900 rounded-lg max-h-48">
          <ScrollArea className="h-48 p-3">
            <div className="space-y-2">
              {mockConversations.map((conv) => (
                <div key={conv.id} className="flex justify-between items-center p-2 bg-neutral-800 rounded">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-200">{conv.user}</p>
                      <p className="text-xs text-neutral-400">{conv.messages} mensagens</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-neutral-400">{conv.date}</p>
                    <Badge 
                      variant={conv.status === 'ativa' ? 'default' : 
                              conv.status === 'escalada' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {conv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Logs do Sistema */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-neutral-200 text-sm font-medium">
            Logs do Sistema
          </Label>
          <Button
            onClick={exportLogs}
            variant="outline"
            size="sm"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Logs
          </Button>
        </div>
        <div className="bg-neutral-900 rounded-lg max-h-48">
          <ScrollArea className="h-48 p-3">
            <div className="space-y-1">
              {mockLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-2 text-sm">
                  <div className="flex items-center gap-2">
                    {log.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                    {log.type === 'warning' && <AlertCircle className="w-4 h-4 text-orange-400" />}
                    {log.type === 'info' && <Clock className="w-4 h-4 text-blue-400" />}
                    <span className="text-xs text-neutral-500">[{log.timestamp}]</span>
                  </div>
                  <span 
                    className={`flex-1 ${
                      log.type === 'error' ? 'text-red-300' : 
                      log.type === 'warning' ? 'text-orange-300' : 
                      'text-neutral-300'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Feedback dos Usuários */}
      <div className="space-y-3">
        <Label className="text-neutral-200 text-sm font-medium">
          Feedback dos Usuários
        </Label>
        <div className="bg-neutral-900 rounded-lg max-h-48">
          <ScrollArea className="h-48 p-3">
            <div className="space-y-3">
              {mockFeedback.map((feedback) => (
                <div key={feedback.id} className="p-3 bg-neutral-800 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < feedback.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-neutral-500'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-neutral-400">{feedback.user}</span>
                    </div>
                    <span className="text-xs text-neutral-500">{feedback.date}</span>
                  </div>
                  <p className="text-sm text-neutral-300">{feedback.comment}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Nota sobre Integração */}
      <div className="p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
        <h4 className="text-sm font-medium text-neutral-200 mb-2">Funcionalidades de Monitoramento</h4>
        <div className="text-xs text-neutral-400 space-y-1">
          <p>• Dados são exemplo fictício para demonstração</p>
          <p>• Exportação preparada para integração com backend</p>
          <p>• Logs em tempo real serão implementados na integração</p>
          <p>• Relatórios detalhados disponíveis após configuração</p>
        </div>
      </div>
    </div>
  );
};
