
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GeneralTabProps {
  data: {
    agentName: string;
    description: string;
    defaultLanguage: string;
    voiceTone: string;
  };
  onChange: (data: any) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ data, onChange }) => {
  const handleChange = (field: string, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="agentName" className="text-neutral-200">
          Nome do Agente *
        </Label>
        <Input
          id="agentName"
          value={data.agentName}
          onChange={(e) => handleChange('agentName', e.target.value)}
          placeholder="Ex: Copy Chief Assistant"
          className="bg-neutral-900 border-neutral-700 text-white"
        />
        <p className="text-xs text-neutral-400">
          Nome que será exibido nas conversas com o agente
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-neutral-200">
          Descrição do Agente
        </Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Descreva o propósito e função principal do seu agente..."
          className="bg-neutral-900 border-neutral-700 text-white min-h-[80px]"
        />
        <p className="text-xs text-neutral-400">
          Descrição detalhada das capacidades e objetivo do agente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-neutral-200">
            Idioma Padrão *
          </Label>
          <Select value={data.defaultLanguage} onValueChange={(value) => handleChange('defaultLanguage', value)}>
            <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white">
              <SelectValue placeholder="Selecione o idioma" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-700">
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="es-ES">Español</SelectItem>
              <SelectItem value="fr-FR">Français</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-neutral-400">
            Idioma principal para as respostas do agente
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-neutral-200">
            Tom de Voz/Persona *
          </Label>
          <Select value={data.voiceTone} onValueChange={(value) => handleChange('voiceTone', value)}>
            <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white">
              <SelectValue placeholder="Selecione o tom" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-700">
              <SelectItem value="profissional">Profissional</SelectItem>
              <SelectItem value="amigavel">Amigável</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="criativo">Criativo</SelectItem>
              <SelectItem value="tecnico">Técnico</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-neutral-400">
            Define a personalidade e estilo de comunicação
          </p>
        </div>
      </div>

      <div className="p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
        <h4 className="text-sm font-medium text-neutral-200 mb-2">Exemplo de Configuração</h4>
        <div className="text-xs text-neutral-400 space-y-1">
          <p><strong>Nome:</strong> Copy Chief Assistant</p>
          <p><strong>Descrição:</strong> Especialista em copywriting e marketing digital</p>
          <p><strong>Tom:</strong> Profissional e criativo</p>
        </div>
      </div>
    </div>
  );
};
