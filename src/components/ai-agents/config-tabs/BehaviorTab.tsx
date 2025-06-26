
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, MessageCircle, Shield, Plus, X } from "lucide-react";

export const BehaviorTab: React.FC = () => {
  const [config, setConfig] = useState({
    enableFilter: true,
    responseLength: [150],
    creativityLevel: [7],
    fallbackMessage: 'Desculpe, não entendi sua pergunta. Pode reformular?',
    maxTokens: 1000
  });

  const [forbiddenWords, setForbiddenWords] = useState<string[]>(['']);
  const [standardResponses, setStandardResponses] = useState([
    { trigger: 'oi', response: 'Olá! Como posso ajudá-lo hoje?' },
    { trigger: 'obrigado', response: 'Fico feliz em ajudar!' }
  ]);

  const addForbiddenWord = () => {
    setForbiddenWords([...forbiddenWords, '']);
  };

  const updateForbiddenWord = (index: number, value: string) => {
    const newWords = [...forbiddenWords];
    newWords[index] = value;
    setForbiddenWords(newWords);
  };

  const removeForbiddenWord = (index: number) => {
    setForbiddenWords(forbiddenWords.filter((_, i) => i !== index));
  };

  const addStandardResponse = () => {
    setStandardResponses([...standardResponses, { trigger: '', response: '' }]);
  };

  const updateStandardResponse = (index: number, field: 'trigger' | 'response', value: string) => {
    const newResponses = [...standardResponses];
    newResponses[index][field] = value;
    setStandardResponses(newResponses);
  };

  const removeStandardResponse = (index: number) => {
    setStandardResponses(standardResponses.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // TODO: Implementar integração com backend
    console.log('Salvando configurações de comportamento:', { config, forbiddenWords, standardResponses });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white">Comportamento do Agente</h3>
        <p className="text-sm text-neutral-400">
          Configure como o agente deve se comportar nas conversas
        </p>
      </div>

      {/* Controles Gerais */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Controles de Resposta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtro de Conteúdo */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Filtro de Conteúdo</Label>
              <p className="text-xs text-neutral-400">Ativar moderação automática</p>
            </div>
            <Switch
              checked={config.enableFilter}
              onCheckedChange={(checked) => setConfig({ ...config, enableFilter: checked })}
            />
          </div>

          {/* Tamanho das Respostas */}
          <div className="space-y-3">
            <Label className="text-white">
              Tamanho das Respostas: {config.responseLength[0]} palavras
            </Label>
            <Slider
              value={config.responseLength}
              onValueChange={(value) => setConfig({ ...config, responseLength: value })}
              max={500}
              min={50}
              step={25}
              className="w-full"
            />
          </div>

          {/* Nível de Criatividade */}
          <div className="space-y-3">
            <Label className="text-white">
              Criatividade: {config.creativityLevel[0]}/10
            </Label>
            <Slider
              value={config.creativityLevel}
              onValueChange={(value) => setConfig({ ...config, creativityLevel: value })}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Palavras Proibidas */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Palavras Proibidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {forbiddenWords.map((word, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={word}
                  onChange={(e) => updateForbiddenWord(index, e.target.value)}
                  placeholder="Palavra proibida"
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
                <Button
                  onClick={() => removeForbiddenWord(index)}
                  variant="outline"
                  size="sm"
                  className="px-3"
                  disabled={forbiddenWords.length <= 1}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button onClick={addForbiddenWord} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Palavra
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Respostas Padrão */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Respostas Automáticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {standardResponses.map((item, index) => (
              <div key={index} className="grid grid-cols-2 gap-2">
                <Input
                  value={item.trigger}
                  onChange={(e) => updateStandardResponse(index, 'trigger', e.target.value)}
                  placeholder="Palavra gatilho"
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
                <div className="flex gap-2">
                  <Input
                    value={item.response}
                    onChange={(e) => updateStandardResponse(index, 'response', e.target.value)}
                    placeholder="Resposta automática"
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                  <Button
                    onClick={() => removeStandardResponse(index)}
                    variant="outline"
                    size="sm"
                    className="px-3"
                    disabled={standardResponses.length <= 1}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button onClick={addStandardResponse} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Resposta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mensagem de Fallback */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Mensagem de Fallback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={config.fallbackMessage}
            onChange={(e) => setConfig({ ...config, fallbackMessage: e.target.value })}
            placeholder="Mensagem exibida quando o agente não souber responder"
            className="bg-neutral-800 border-neutral-700 text-white resize-none"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end pt-4 border-t border-neutral-800">
        <Button onClick={handleSave} className="bg-slate-50 text-black hover:bg-slate-200">
          Salvar Comportamento
        </Button>
      </div>
    </div>
  );
};
