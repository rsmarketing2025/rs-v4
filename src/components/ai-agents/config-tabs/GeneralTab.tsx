
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// ID fixo do agente
const AGENT_ID = 'agent-copy-chief-001';

export const GeneralTab: React.FC = () => {
  const [config, setConfig] = useState({
    id: AGENT_ID,
    name: 'Copy Chief',
    description: 'Assistente especializado em copywriting e marketing',
    language: 'pt-BR',
    tone: 'professional'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('agent_configurations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setConfig({
          id: AGENT_ID,
          name: data.agent_name || 'Copy Chief',
          description: data.agent_description || 'Assistente especializado em copywriting e marketing',
          language: data.default_language || 'pt-BR',
          tone: data.voice_tone || 'professional'
        });
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(AGENT_ID);
      setCopied(true);
      toast({
        title: "ID copiado",
        description: "ID do agente copiado para a área de transferência!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar ID:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save to database first
      const configData = {
        agent_name: config.name,
        agent_description: config.description,
        voice_tone: config.tone,
        default_language: config.language,
        user_id: user.id
      };

      // Check if configuration already exists
      const { data: existingConfig } = await supabase
        .from('agent_configurations')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingConfig) {
        // Update existing
        const { error } = await supabase
          .from('agent_configurations')
          .update(configData)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('agent_configurations')
          .insert(configData);
        
        if (error) throw error;
      }

      // Send to webhook
      console.log('Enviando configurações para o webhook:', configData);
      
      const response = await fetch('https://webhook-automatios-rsmtk.abbadigital.com.br/webhook/rag-rs-copy-geral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id: AGENT_ID,
          tab_name: 'general',
          data: configData,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Resposta do webhook:', result);

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-neutral-700 rounded w-1/4"></div>
          <div className="h-10 bg-neutral-700 rounded"></div>
          <div className="h-4 bg-neutral-700 rounded w-1/4"></div>
          <div className="h-24 bg-neutral-700 rounded"></div>
        </div>
      </div>
    );
  }

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
        {/* ID do Agente */}
        <div className="space-y-2">
          <Label htmlFor="agent-id" className="text-white">
            ID do Agente
          </Label>
          <div className="flex gap-2">
            <Input
              id="agent-id"
              value={config.id}
              readOnly
              className="bg-neutral-800 border-neutral-700 text-neutral-300 cursor-not-allowed"
            />
            <Button
              onClick={handleCopyId}
              variant="outline"
              size="sm"
              className="border-neutral-700 hover:bg-neutral-800"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-neutral-500">
            ID único e fixo do agente (somente leitura)
          </p>
        </div>

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
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-slate-50 text-black hover:bg-slate-200"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

// Exportar o ID do agente para uso em outros componentes
export { AGENT_ID };
