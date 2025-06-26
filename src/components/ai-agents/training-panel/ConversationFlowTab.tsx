
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, GitBranch, Users } from "lucide-react";

interface ConversationFlowTabProps {
  data: {
    preDefinedFlows: Array<{ name: string; trigger: string; steps: string[] }>;
    conditions: Array<{ condition: string; action: string }>;
    escalationRules: Array<{ trigger: string; action: string }>;
  };
  onChange: (data: any) => void;
}

export const ConversationFlowTab: React.FC<ConversationFlowTabProps> = ({ data, onChange }) => {
  const [newFlowName, setNewFlowName] = React.useState('');
  const [newFlowTrigger, setNewFlowTrigger] = React.useState('');
  const [newCondition, setNewCondition] = React.useState('');
  const [newConditionAction, setNewConditionAction] = React.useState('');
  const [newEscalationTrigger, setNewEscalationTrigger] = React.useState('');
  const [newEscalationAction, setNewEscalationAction] = React.useState('');

  const addPreDefinedFlow = () => {
    if (newFlowName.trim() && newFlowTrigger.trim()) {
      onChange({ 
        preDefinedFlows: [...data.preDefinedFlows, { 
          name: newFlowName.trim(), 
          trigger: newFlowTrigger.trim(),
          steps: ['Passo 1: Saudação', 'Passo 2: Coleta de informações', 'Passo 3: Resolução']
        }] 
      });
      setNewFlowName('');
      setNewFlowTrigger('');
    }
  };

  const removePreDefinedFlow = (index: number) => {
    const updated = data.preDefinedFlows.filter((_, i) => i !== index);
    onChange({ preDefinedFlows: updated });
  };

  const addCondition = () => {
    if (newCondition.trim() && newConditionAction.trim()) {
      onChange({ 
        conditions: [...data.conditions, { 
          condition: newCondition.trim(), 
          action: newConditionAction.trim() 
        }] 
      });
      setNewCondition('');
      setNewConditionAction('');
    }
  };

  const removeCondition = (index: number) => {
    const updated = data.conditions.filter((_, i) => i !== index);
    onChange({ conditions: updated });
  };

  const addEscalationRule = () => {
    if (newEscalationTrigger.trim() && newEscalationAction.trim()) {
      onChange({ 
        escalationRules: [...data.escalationRules, { 
          trigger: newEscalationTrigger.trim(), 
          action: newEscalationAction.trim() 
        }] 
      });
      setNewEscalationTrigger('');
      setNewEscalationAction('');
    }
  };

  const removeEscalationRule = (index: number) => {
    const updated = data.escalationRules.filter((_, i) => i !== index);
    onChange({ escalationRules: updated });
  };

  return (
    <div className="space-y-6">
      {/* Fluxos Pré-definidos */}
      <div className="space-y-3">
        <Label className="text-neutral-200 text-sm font-medium flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-blue-400" />
          Fluxos de Conversa Pré-programados
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input
            value={newFlowName}
            onChange={(e) => setNewFlowName(e.target.value)}
            placeholder="Nome do fluxo (ex: Onboarding)"
            className="bg-neutral-900 border-neutral-700 text-white"
          />
          <Input
            value={newFlowTrigger}
            onChange={(e) => setNewFlowTrigger(e.target.value)}
            placeholder="Palavra-chave trigger (ex: começar)"
            className="bg-neutral-900 border-neutral-700 text-white"
          />
        </div>
        <Button
          onClick={addPreDefinedFlow}
          variant="outline"
          size="sm"
          className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Fluxo
        </Button>
        <p className="text-xs text-neutral-400">
          Defina sequências estruturadas de perguntas/respostas para situações específicas
        </p>
        
        {data.preDefinedFlows.length > 0 && (
          <div className="space-y-2">
            {data.preDefinedFlows.map((flow, index) => (
              <div key={index} className="bg-neutral-900 rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-neutral-200">{flow.name}</p>
                    <p className="text-xs text-neutral-400">Trigger: "{flow.trigger}"</p>
                  </div>
                  <Button
                    onClick={() => removePreDefinedFlow(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-xs text-neutral-500">
                  {flow.steps.join(' → ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Condições e Ramificações */}
      <div className="space-y-3">
        <Label className="text-neutral-200 text-sm font-medium">
          Condições e Ramificações (If/Else)
        </Label>
        <div className="space-y-2">
          <Input
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            placeholder="Se o usuário disser... (condição)"
            className="bg-neutral-900 border-neutral-700 text-white"
          />
          <Select value={newConditionAction} onValueChange={setNewConditionAction}>
            <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white">
              <SelectValue placeholder="Então o agente deve..." />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-700">
              <SelectItem value="responder_especifico">Dar resposta específica</SelectItem>
              <SelectItem value="iniciar_fluxo">Iniciar fluxo específico</SelectItem>
              <SelectItem value="coletar_dados">Coletar mais dados</SelectItem>
              <SelectItem value="escalar_humano">Escalar para humano</SelectItem>
              <SelectItem value="finalizar_conversa">Finalizar conversa</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={addCondition}
            variant="outline"
            size="sm"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Condição
          </Button>
        </div>
        
        {data.conditions.length > 0 && (
          <div className="space-y-2">
            {data.conditions.map((condition, index) => (
              <div key={index} className="bg-neutral-900 rounded p-3 flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-neutral-300">Se: </span>
                  <span className="text-blue-300">"{condition.condition}"</span>
                  <span className="text-neutral-300"> → Então: </span>
                  <span className="text-green-300">{condition.action}</span>
                </div>
                <Button
                  onClick={() => removeCondition(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Regras de Escalação */}
      <div className="space-y-3">
        <Label className="text-neutral-200 text-sm font-medium flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-400" />
          Regras de Escalação para Humano
        </Label>
        <div className="space-y-2">
          <Input
            value={newEscalationTrigger}
            onChange={(e) => setNewEscalationTrigger(e.target.value)}
            placeholder="Quando escalá? (ex: usuário insatisfeito)"
            className="bg-neutral-900 border-neutral-700 text-white"
          />
          <Select value={newEscalationAction} onValueChange={setNewEscalationAction}>
            <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white">
              <SelectValue placeholder="Ação de escalação..." />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-700">
              <SelectItem value="transferir_imediato">Transferir imediatamente</SelectItem>
              <SelectItem value="notificar_supervisor">Notificar supervisor</SelectItem>
              <SelectItem value="agendar_callback">Agendar callback</SelectItem>
              <SelectItem value="criar_ticket">Criar ticket de suporte</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={addEscalationRule}
            variant="outline"
            size="sm"
            className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Regra
          </Button>
        </div>
        
        {data.escalationRules.length > 0 && (
          <div className="space-y-2">
            {data.escalationRules.map((rule, index) => (
              <div key={index} className="bg-neutral-900 rounded p-3 flex justify-between items-center">
                <div className="text-sm">
                  <span className="text-orange-300">Trigger: </span>
                  <span className="text-neutral-300">"{rule.trigger}"</span>
                  <span className="text-orange-300"> → Ação: </span>
                  <span className="text-neutral-300">{rule.action}</span>
                </div>
                <Button
                  onClick={() => removeEscalationRule(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exemplo */}
      <div className="p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
        <h4 className="text-sm font-medium text-neutral-200 mb-2">Exemplo de Configuração de Fluxo</h4>
        <div className="text-xs text-neutral-400 space-y-1">
          <p><strong>Fluxo:</strong> "Suporte Técnico" → trigger: "problema"</p>
          <p><strong>Condição:</strong> Se "urgente" → iniciar fluxo prioritário</p>
          <p><strong>Escalação:</strong> Se "insatisfeito" → transferir para supervisor</p>
        </div>
      </div>
    </div>
  );
};
