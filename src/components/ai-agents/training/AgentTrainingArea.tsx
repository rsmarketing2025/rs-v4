
import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GeneralSettings } from "./GeneralSettings";
import { TrainingFiles } from "./TrainingFiles";
import { ReferenceLinks } from "./ReferenceLinks";
import { ManualContexts } from "./ManualContexts";
import { BehaviorSettings } from "./BehaviorSettings";
import { ConversationFlows } from "./ConversationFlows";
import { 
  Settings, 
  Upload, 
  Link, 
  FileText, 
  Brain, 
  GitBranch,
  Save,
  Send
} from "lucide-react";

export const AgentTrainingArea: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://webhook-automatios-rsmtk.abbadigital.com.br/webhook/rag-midia-rs-copy");
  const { toast } = useToast();

  // Function to collect all training data
  const collectAllTrainingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Collect general settings
      const { data: agentConfig } = await supabase
        .from('agent_configurations')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Collect training files
      const { data: filesData } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', 'training')
        .eq('data_type', 'file')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Collect reference links
      const { data: linksData } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', 'training')
        .eq('data_type', 'link')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Collect manual contexts
      const { data: contextsData } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', 'manual_contexts')
        .eq('data_type', 'manual_prompt')
        .eq('status', 'active')
        .maybeSingle();

      // Format the payload
      const files = (filesData || []).map(file => ({
        id: file.id,
        file_name: file.file_name,
        file_type: file.file_type,
        file_url: file.file_url,
        file_size: file.file_size
      }));

      const links = (linksData || []).map(link => ({
        id: link.id,
        link_title: link.link_title || link.title,
        link_url: link.link_url,
        link_description: link.link_description || link.description
      }));

      let contexts = [];
      if (contextsData && contextsData.metadata) {
        const metadata = contextsData.metadata as any;
        contexts = Array.isArray(metadata.contexts) ? metadata.contexts : [];
      }

      const payload = {
        agent_id: agentConfig?.id || 'default',
        agent_name: agentConfig?.agent_name || 'Copy Chief',
        agent_description: agentConfig?.agent_description || '',
        default_language: agentConfig?.default_language || 'pt-BR',
        voice_tone: agentConfig?.voice_tone || 'formal',
        training_data: {
          files,
          links,
          contexts: contexts.map(context => ({
            id: context.id,
            context_title: context.context_title,
            context_content: context.context_content,
            tags: context.tags || []
          }))
        }
      };

      return payload;
    } catch (error) {
      console.error('Error collecting training data:', error);
      throw error;
    }
  };

  // Handle centralized save and webhook
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      console.log('Starting centralized save...');
      
      const payload = await collectAllTrainingData();
      console.log('Collected payload:', payload);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('send-agent-training-webhook', {
        body: {
          payload,
          webhookUrl
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Edge function response:', data);

      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Configurações salvas e webhook enviado com sucesso!"
        });
      } else {
        throw new Error(data.error || 'Unknown error');
      }

    } catch (error) {
      console.error('Error saving all data:', error);
      toast({
        title: "Erro",
        description: `Erro ao salvar: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-neutral-950 border-neutral-800 h-full flex flex-col">
      <CardContent className="p-0 flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-6 bg-neutral-900 flex-shrink-0">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Arquivos
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Links
            </TabsTrigger>
            <TabsTrigger value="contexts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Contextos
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Comportamento
            </TabsTrigger>
            <TabsTrigger value="flows" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Fluxos
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-6">
                <TabsContent value="general" className="space-y-6 mt-0">
                  <GeneralSettings />
                </TabsContent>

                <TabsContent value="files" className="space-y-6 mt-0">
                  <TrainingFiles />
                </TabsContent>

                <TabsContent value="links" className="space-y-6 mt-0">
                  <ReferenceLinks />
                </TabsContent>

                <TabsContent value="contexts" className="space-y-6 mt-0">
                  <ManualContexts />
                </TabsContent>

                <TabsContent value="behavior" className="space-y-6 mt-0">
                  <BehaviorSettings />
                </TabsContent>

                <TabsContent value="flows" className="space-y-6 mt-0 h-full">
                  <div className="h-[calc(100vh-200px)]">
                    <ConversationFlows />
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>

        {/* Centralized Save Section */}
        <div className="flex-shrink-0 border-t border-neutral-800 p-6">
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Send className="w-5 h-5" />
                Salvar e Enviar Treinamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url" className="text-white">URL do Webhook (n8n)</Label>
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="bg-neutral-800 border-neutral-600 text-white"
                  placeholder="https://seu-webhook.com/endpoint"
                />
                <p className="text-xs text-neutral-500">
                  Configurações de todas as abas serão enviadas para este endpoint
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveAll}
                  disabled={saving || !webhookUrl.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Salvando e Enviando...' : 'Salvar Tudo e Enviar Webhook'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
