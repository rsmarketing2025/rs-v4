
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BarChart3, Activity, Download, Eye, Settings, AlertCircle } from "lucide-react";

export const MonitoringTab: React.FC = () => {
  const [config, setConfig] = useState({
    enableLogging: true,
    enableAnalytics: true,
    enableFeedback: true,
    logLevel: 'info'
  });

  const [timeRange, setTimeRange] = useState('7d');

  // Dados mock para demonstração
  const stats = {
    totalConversations: 1247,
    totalMessages: 5692,
    avgResponseTime: '2.3s',
    satisfactionRate: 4.2
  };

  const recentLogs = [
    { time: '10:30', type: 'info', message: 'Conversa iniciada pelo usuário user_123' },
    { time: '10:25', type: 'warning', message: 'Tentativa de palavra proibida detectada' },
    { time: '10:20', type: 'info', message: 'Resposta automática enviada para pergunta sobre preços' },
    { time: '10:15', type: 'error', message: 'Falha na conexão com webhook externo' }
  ];

  const handleExportData = () => {
    // TODO: Implementar exportação de dados
    console.log('Exportando dados de monitoramento...');
  };

  const handleSave = () => {
    // TODO: Implementar integração com backend
    console.log('Salvando configurações de monitoramento:', config);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white">Monitoramento & Analytics</h3>
        <p className="text-sm text-neutral-400">
          Acompanhe o desempenho e comportamento do seu agente
        </p>
      </div>

      {/* Configurações de Monitoramento */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações de Monitoramento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Logs Detalhados</Label>
              <p className="text-xs text-neutral-400">Registrar todas as interações</p>
            </div>
            <Switch
              checked={config.enableLogging}
              onCheckedChange={(checked) => setConfig({ ...config, enableLogging: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Analytics</Label>
              <p className="text-xs text-neutral-400">Coletar métricas de performance</p>
            </div>
            <Switch
              checked={config.enableAnalytics}
              onCheckedChange={(checked) => setConfig({ ...config, enableAnalytics: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Sistema de Feedback</Label>
              <p className="text-xs text-neutral-400">Permitir avaliação das respostas</p>
            </div>
            <Switch
              checked={config.enableFeedback}
              onCheckedChange={(checked) => setConfig({ ...config, enableFeedback: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Nível de Log</Label>
            <Select
              value={config.logLevel}
              onValueChange={(value) => setConfig({ ...config, logLevel: value })}
            >
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-700">
                <SelectItem value="error">Apenas Erros</SelectItem>
                <SelectItem value="warning">Avisos e Erros</SelectItem>
                <SelectItem value="info">Informações Gerais</SelectItem>
                <SelectItem value="debug">Debug Completo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalConversations}</div>
            <div className="text-xs text-neutral-400">Conversas</div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalMessages}</div>
            <div className="text-xs text-neutral-400">Mensagens</div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.avgResponseTime}</div>
            <div className="text-xs text-neutral-400">Tempo Médio</div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.satisfactionRate}/5</div>
            <div className="text-xs text-neutral-400">Satisfação</div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Recentes */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Logs Recentes
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-700">
                  <SelectItem value="1h">Última hora</SelectItem>
                  <SelectItem value="24h">Últimas 24h</SelectItem>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLogs.map((log, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-neutral-800 rounded-lg">
                <div className="text-xs text-neutral-400 w-16">{log.time}</div>
                <Badge 
                  variant={log.type === 'error' ? 'destructive' : log.type === 'warning' ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {log.type}
                </Badge>
                <div className="text-sm text-white flex-1">{log.message}</div>
                {log.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exportar Dados */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Relatórios e Exportação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Exportar dados de conversas e métricas</p>
              <p className="text-sm text-neutral-400">Gere relatórios em formato CSV ou JSON</p>
            </div>
            <Button onClick={handleExportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end pt-4 border-t border-neutral-800">
        <Button onClick={handleSave} className="bg-slate-50 text-black hover:bg-slate-200">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};
