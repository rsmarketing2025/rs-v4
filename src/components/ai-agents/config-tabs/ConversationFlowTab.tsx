
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Plus, Trash2, ArrowRight } from "lucide-react";

interface FlowRule {
  id: string;
  condition: string;
  conditionType: 'contains' | 'equals' | 'starts_with' | 'ends_with';
  action: string;
  actionType: 'redirect' | 'response' | 'escalate';
  priority: number;
}

export const ConversationFlowTab: React.FC = () => {
  const [flows, setFlows] = useState<FlowRule[]>([
    {
      id: '1',
      condition: 'preço',
      conditionType: 'contains',
      action: 'Vou te ajudar com informações sobre preços. Que produto você tem interesse?',
      actionType: 'response',
      priority: 1
    }
  ]);

  const addFlow = () => {
    const newFlow: FlowRule = {
      id: Date.now().toString(),
      condition: '',
      conditionType: 'contains',
      action: '',
      actionType: 'response',
      priority: flows.length + 1
    };
    setFlows([...flows, newFlow]);
  };

  const updateFlow = (id: string, field: keyof FlowRule, value: any) => {
    setFlows(flows.map(flow => 
      flow.id === id ? { ...flow, [field]: value } : flow
    ));
  };

  const removeFlow = (id: string) => {
    setFlows(flows.filter(flow => flow.id !== id));
  };

  const handleSave = () => {
    // TODO: Implementar integração com backend
    console.log('Salvando fluxos de conversa:', flows);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Fluxos de Conversa</h3>
          <p className="text-sm text-neutral-400">
            Configure regras automáticas para direcionamento de conversas
          </p>
        </div>
        <Button onClick={addFlow} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      {/* Lista de Regras */}
      <div className="space-y-4">
        {flows.map((flow, index) => (
          <Card key={flow.id} className="bg-neutral-900 border-neutral-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Regra #{flow.priority}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {flow.actionType === 'response' ? 'Resposta' : 
                     flow.actionType === 'redirect' ? 'Redirecionamento' : 'Escalar'}
                  </Badge>
                  <Button
                    onClick={() => removeFlow(flow.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Condição */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Se a mensagem</Label>
                  <Select
                    value={flow.conditionType}
                    onValueChange={(value) => updateFlow(flow.id, 'conditionType', value)}
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700">
                      <SelectItem value="contains">contém</SelectItem>
                      <SelectItem value="equals">é igual a</SelectItem>
                      <SelectItem value="starts_with">começa com</SelectItem>
                      <SelectItem value="ends_with">termina com</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Texto/Palavra</Label>
                  <Input
                    value={flow.condition}
                    onChange={(e) => updateFlow(flow.id, 'condition', e.target.value)}
                    placeholder="Ex: preço, orçamento, etc."
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>

              {/* Ação */}
              <div className="flex items-center gap-2 text-neutral-400">
                <ArrowRight className="w-4 h-4" />
                <span className="text-sm">Então</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Ação</Label>
                  <Select
                    value={flow.actionType}
                    onValueChange={(value) => updateFlow(flow.id, 'actionType', value)}
                  >
                    <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700">
                      <SelectItem value="response">Responder com</SelectItem>
                      <SelectItem value="redirect">Redirecionar para</SelectItem>
                      <SelectItem value="escalate">Escalar para humano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-white">
                    {flow.actionType === 'response' ? 'Mensagem de Resposta' : 
                     flow.actionType === 'redirect' ? 'URL de Redirecionamento' : 'Motivo do Escalonamento'}
                  </Label>
                  <Textarea
                    value={flow.action}
                    onChange={(e) => updateFlow(flow.id, 'action', e.target.value)}
                    placeholder={
                      flow.actionType === 'response' ? 'Digite a resposta automática...' :
                      flow.actionType === 'redirect' ? 'https://exemplo.com/pagina' :
                      'Motivo para transferir para atendimento humano'
                    }
                    className="bg-neutral-800 border-neutral-700 text-white resize-none"
                    rows={2}
                  />
                </div>
              </div>

              {/* Prioridade */}
              <div className="w-32">
                <Label className="text-white">Prioridade</Label>
                <Input
                  type="number"
                  value={flow.priority}
                  onChange={(e) => updateFlow(flow.id, 'priority', parseInt(e.target.value))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                  min={1}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {flows.length === 0 && (
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="py-12 text-center">
            <GitBranch className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <p className="text-neutral-400 mb-4">Nenhum fluxo configurado</p>
            <Button onClick={addFlow} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Regra
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Botão de Salvar */}
      <div className="flex justify-end pt-4 border-t border-neutral-800">
        <Button onClick={handleSave} className="bg-slate-50 text-black hover:bg-slate-200">
          Salvar Fluxos
        </Button>
      </div>
    </div>
  );
};
