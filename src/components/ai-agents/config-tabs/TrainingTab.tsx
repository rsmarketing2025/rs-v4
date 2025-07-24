
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TrainingFiles } from "../training/TrainingFiles";
import { ReferenceLinks } from "../training/ReferenceLinks";
import { AGENT_ID } from "./GeneralTab";

interface TrainingFile {
  id: string;
  file_name: string;
  file_url?: string;
  file_content?: string;
}

interface ReferenceLink {
  id: string;
  link_title: string;
  link_url: string;
  link_description?: string;
}

export const TrainingTab: React.FC = () => {
  const [manualPrompt, setManualPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  const tabName = "training";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load manual prompt from unified table
      const { data: promptData } = await supabase
        .from('agent_training_data')
        .select('manual_prompt')
        .eq('user_id', user.id)
        .eq('tab_name', tabName)
        .eq('data_type', 'manual_prompt')
        .maybeSingle();

      if (promptData) {
        setManualPrompt(promptData.manual_prompt || '');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const collectTrainingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get all training data for this tab
      const { data: trainingData, error } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', tabName)
        .eq('status', 'active');

      if (error) throw error;

      // Separate by type and format complete data
      const files = trainingData?.filter(item => item.data_type === 'file').map(file => ({
        id: file.id,
        file_name: file.file_name,
        file_type: file.file_type,
        file_url: file.file_url,
        file_content: file.file_content,
        file_size: file.file_size,
        created_at: file.created_at
      })) || [];

      const links = trainingData?.filter(item => item.data_type === 'link').map(link => ({
        id: link.id,
        link_title: link.link_title,
        link_url: link.link_url,
        link_description: link.link_description,
        created_at: link.created_at
      })) || [];

      const promptData = trainingData?.find(item => item.data_type === 'manual_prompt');
      const manualPrompt = promptData ? {
        id: promptData.id,
        content: promptData.manual_prompt,
        created_at: promptData.created_at
      } : null;

      return {
        files,
        links,
        manualPrompt,
        // Keep legacy format for backward compatibility
        manualText: promptData?.manual_prompt || ''
      };
    } catch (error) {
      console.error('Error collecting training data:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      console.log('Salvando dados de treinamento...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save or update manual prompt
      const { error } = await supabase
        .from('agent_training_data')
        .upsert({
          user_id: user.id,
          tab_name: tabName,
          data_type: 'manual_prompt',
          manual_prompt: manualPrompt,
          status: 'active'
        }, {
          onConflict: 'user_id,tab_name,data_type'
        });

      if (error) throw error;
      
      // Collect all training data
      const trainingData = await collectTrainingData();
      
      // Get the saved manual prompt ID by re-querying the database
      const { data: manualPromptData } = await supabase
        .from('agent_training_data')
        .select('id')
        .eq('user_id', user.id)
        .eq('tab_name', tabName)
        .eq('data_type', 'manual_prompt')
        .eq('status', 'active')
        .maybeSingle();

      // Prepare data for webhook with complete data
      const webhookData = {
        agent_id: AGENT_ID,
        user_id: user.id,
        tab_name: tabName,
        // Complete data objects
        files: trainingData.files,
        links: trainingData.links,
        manual_prompt: trainingData.manualPrompt,
        // Legacy IDs for backward compatibility
        file_ids: trainingData.files.map(file => file.id),
        link_ids: trainingData.links.map(link => link.id),
        manual_prompt_id: manualPromptData?.id || null
      };

      console.log('Enviando dados para o webhook:', webhookData);

      const response = await fetch('https://webhook-automatios-rsmtk.abbadigital.com.br/webhook/rag-midia-rs-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Resposta do webhook:', result);

      toast({
        title: "Sucesso",
        description: "Dados de treinamento salvos e enviados com sucesso!",
      });

      // Refresh components to show updated data
      setRefreshKey(prev => prev + 1);

    } catch (error) {
      console.error('Erro ao salvar dados de treinamento:', error);
      
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados de treinamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Dados de Treinamento</h3>
          <p className="text-sm text-neutral-400">
            Adicione materiais para treinar e personalizar seu agente
          </p>
        </div>
        <Badge variant="outline" className="text-neutral-300 border-neutral-600">
          {AGENT_ID}
        </Badge>
      </div>

      {/* Training Files */}
      <div key={`files-${refreshKey}`}>
        <TrainingFiles />
      </div>

      {/* Reference Links */}
      <div key={`links-${refreshKey}`}>
        <ReferenceLinks />
      </div>

      {/* Manual Text */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Conhecimento Manual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="manual-text" className="text-white">
              Instruções e Conhecimento Específico
            </Label>
            <Textarea
              id="manual-text"
              value={manualPrompt}
              onChange={(e) => setManualPrompt(e.target.value)}
              placeholder="Adicione informações específicas, instruções especiais, ou conhecimento que o agente deve ter..."
              className="bg-neutral-800 border-neutral-700 text-white resize-none"
              rows={6}
            />
            <p className="text-xs text-neutral-500">
              Este texto será usado como conhecimento base para treinar o agente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-neutral-800">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-slate-50 text-black hover:bg-slate-200"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Salvando e Enviando...' : 'Salvar e Enviar Treinamento'}
        </Button>
      </div>
    </div>
  );
};
