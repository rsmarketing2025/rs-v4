
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Save, Plus, X } from "lucide-react";

interface BehaviorSettings {
  id?: string;
  prohibited_words: string[];
  default_responses: Record<string, string>;
  fallback_message: string;
  response_examples: string[];
  max_response_length: number;
  preferred_format: string;
}

export const BehaviorSettings: React.FC = () => {
  const [settings, setSettings] = useState<BehaviorSettings>({
    prohibited_words: [],
    default_responses: {},
    fallback_message: 'Desculpe, não consegui entender sua pergunta. Pode reformular?',
    response_examples: [],
    max_response_length: 1000,
    preferred_format: 'text'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newExample, setNewExample] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('agent_behavior_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSettings({
          id: data.id,
          prohibited_words: data.prohibited_words || [],
          default_responses: data.default_responses || {},
          fallback_message: data.fallback_message || 'Desculpe, não consegui entender sua pergunta. Pode reformular?',
          response_examples: data.response_examples || [],
          max_response_length: data.max_response_length || 1000,
          preferred_format: data.preferred_format || 'text'
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const settingsData = {
        ...settings,
        user_id: user.id
      };

      if (settings.id) {
        const { error } = await supabase
          .from('agent_behavior_settings')
          .update(settingsData)
          .eq('id', settings.id);
        
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('agent_behavior_settings')
          .insert(settingsData)
          .select()
          .single();
        
        if (error) throw error;
        if (data) {
          setSettings(prev => ({ ...prev, id: data.id }));
        }
      }

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addProhibitedWord = () => {
    const word = newWord.trim().toLowerCase();
    if (word && !settings.prohibited_words.includes(word)) {
      setSettings(prev => ({
        ...prev,
        prohibited_words: [...prev.prohibited_words, word]
      }));
      setNewWord('');
    }
  };

  const removeProhibitedWord = (wordToRemove: string) => {
    setSettings(prev => ({
      ...prev,
      prohibited_words: prev.prohibited_words.filter(word => word !== wordToRemove)
    }));
  };

  const addResponseExample = () => {
    const example = newExample.trim();
    if (example && !settings.response_examples.includes(example)) {
      setSettings(prev => ({
        ...prev,
        response_examples: [...prev.response_examples, example]
      }));
      setNewExample('');
    }
  };

  const removeResponseExample = (exampleToRemove: string) => {
    setSettings(prev => ({
      ...prev,
      response_examples: prev.response_examples.filter(example => example !== exampleToRemove)
    }));
  };

  if (loading) {
    return (
      <Card className="bg-neutral-900 border-neutral-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-neutral-700 rounded w-1/4"></div>
            <div className="h-10 bg-neutral-700 rounded"></div>
            <div className="h-4 bg-neutral-700 rounded w-1/4"></div>
            <div className="h-24 bg-neutral-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-neutral-900 border-neutral-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Configurações de Comportamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="max_length" className="text-white">Tamanho Máximo da Resposta</Label>
            <Input
              id="max_length"
              type="number"
              value={settings.max_response_length}
              onChange={(e) => setSettings(prev => ({ ...prev, max_response_length: parseInt(e.target.value) || 1000 }))}
              className="bg-neutral-800 border-neutral-600 text-white"
              min="100"
              max="5000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred_format" className="text-white">Formato Preferido</Label>
            <Select
              value={settings.preferred_format}
              onValueChange={(value) => setSettings(prev => ({ ...prev, preferred_format: value }))}
            >
              <SelectTrigger className="bg-neutral-800 border-neutral-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-600">
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="structured">Estruturado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fallback_message" className="text-white">Mensagem de Fallback</Label>
          <Textarea
            id="fallback_message"
            value={settings.fallback_message}
            onChange={(e) => setSettings(prev => ({ ...prev, fallback_message: e.target.value }))}
            className="bg-neutral-800 border-neutral-600 text-white"
            placeholder="Mensagem quando o agente não conseguir responder..."
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <Label className="text-white">Palavras Proibidas</Label>
          <div className="flex gap-2">
            <Input
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProhibitedWord())}
              className="bg-neutral-800 border-neutral-600 text-white"
              placeholder="Adicionar palavra proibida..."
            />
            <Button
              onClick={addProhibitedWord}
              variant="outline"
              size="sm"
              className="border-neutral-600"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {settings.prohibited_words.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {settings.prohibited_words.map((word) => (
                <Badge
                  key={word}
                  variant="destructive"
                  className="bg-red-600 text-white"
                >
                  {word}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => removeProhibitedWord(word)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Label className="text-white">Exemplos de Respostas</Label>
          <div className="flex gap-2">
            <Textarea
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              className="bg-neutral-800 border-neutral-600 text-white"
              placeholder="Adicionar exemplo de resposta..."
              rows={2}
            />
            <Button
              onClick={addResponseExample}
              variant="outline"
              size="sm"
              className="border-neutral-600 self-start"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {settings.response_examples.length > 0 && (
            <div className="space-y-2">
              {settings.response_examples.map((example, index) => (
                <div
                  key={index}
                  className="bg-neutral-800 rounded-lg p-3 flex items-start justify-between"
                >
                  <p className="text-neutral-300 text-sm flex-1">{example}</p>
                  <Button
                    onClick={() => removeResponseExample(example)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 h-8 w-8 p-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
