
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save } from "lucide-react";

export const GeneralTab: React.FC = () => {
  const [config, setConfig] = useState({
    name: 'Copy Chief',
    description: 'Assistente especializado em copywriting e marketing',
    language: 'pt-BR',
    tone: 'professional'
  });

  const handleSave = () => {
    // TODO: Implementar integração com backend
    console.log('Salvando configurações gerais:', config);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Configurações Gerais</h3>
          <p className="text-sm text-neutral-400">
            Configure as informações básicas do seu agente
          </p>
        </div>
        <Badge variant="outline" className="text-neutral-300">
          Ativo
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Nome do Agente */}
        <div className="space-y-2">
          <Label htmlFor="agent-name" className="text-white">
            Nome do Agente
          </Label>
          <Input
            id="agent-name"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            className="bg-neutral-900 border-neutral-700 text-white"
            placeholder="Ex: Copy Chief"
          />
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label htmlFor="agent-description" className="text-white">
            Descrição
          </Label>
          <Textarea
            id="agent-description"
            value={config.description}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
            className="bg-neutral-900 border-neutral-700 text-white resize-none"
            rows={3}
            placeholder="Descreva o papel e especialidade do seu agente..."
          />
        </div>

        {/* Idioma */}
        <div className="space-y-2">
          <Label className="text-white">Idioma Principal</Label>
          <Select
            value={config.language}
            onValueChange={(value) => setConfig({ ...config, language: value })}
          >
            <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-700">
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="es-ES">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tom de Voz */}
        <div className="space-y-2">
          <Label className="text-white">Tom de Voz</Label>
          <Select
            value={config.tone}
            onValueChange={(value) => setConfig({ ...config, tone: value })}
          >
            <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-700">
              <SelectItem value="professional">Profissional</SelectItem>
              <SelectItem value="friendly">Amigável</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="enthusiastic">Entusiasmado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botão de Salvar */}
      <div className="flex justify-end pt-4 border-t border-neutral-800">
        <Button onClick={handleSave} className="bg-slate-50 text-black hover:bg-slate-200">
          <Save className="w-4 h-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};
