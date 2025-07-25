
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
  const [webhookUrl, setWebhookUrl] = useState("https://webhook-automatios-rsmtk.abbadigital.com.br/webhook/rag-rs-copy-estrutura-invisivel");
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

      // Collect training files from invisible_structure tab
      const { data: filesData } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', 'invisible_structure')
        .eq('data_type', 'file')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Collect reference links from invisible_structure tab
      const { data: linksData } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', 'invisible_structure')
        .eq('data_type', 'link')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Collect manual contexts from invisible_structure tab
      const { data: contextsData } = await supabase
        .from('agent_training_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('tab_name', 'invisible_structure')
        .eq('data_type', 'manual_prompt')
        .eq('status', 'active')
        .maybeSingle();

      // Collect data from estrutura_invisivel table
      const { data: estruturaInvisivelData } = await supabase
        .from('estrutura_invisivel')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

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
      if (contextsData && contextsData.manual_prompt) {
        contexts = [{
          id: contextsData.id,
          context_title: "Prompt Manual",
          context_content: contextsData.manual_prompt,
          tags: []
        }];
      }

      // Format estrutura invisivel data
      const estruturaInvisivel = (estruturaInvisivelData || []).map(item => ({
        id: item.id,
        titulo: item.titulo,
        conteudo: item.conteudo,
        categoria: item.categoria,
        tipo_estrutura: item.tipo_estrutura,
        nicho: item.nicho,
        tom: item.tom,
        publico_alvo: item.publico_alvo,
        tags: item.tags || [],
        fonte: item.fonte,
        taxa_conversao: item.taxa_conversao,
        nivel_persuasao: item.nivel_persuasao,
        created_at: item.created_at
      }));

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
          })),
          estrutura_invisivel: estruturaInvisivel
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
    const startTime = Date.now();
    
    try {
      console.log('=== FRONTEND WEBHOOK SENDING ===');
      console.log('Starting simplified webhook...');
      console.log('Timestamp:', new Date().toISOString());
      
      const payload = {
        agent_id: "AGENT_ID_CONSTANT",
        tab_name: "invisible_structure"
      };
      
      console.log('Payload to send:', payload);
      console.log('Calling edge function: send-agent-training-webhook');
      
      // Call the edge function with simplified payload
      const invokeStartTime = Date.now();
      const { data, error } = await supabase.functions.invoke('send-agent-training-webhook', {
        body: payload
      });
      const invokeDuration = Date.now() - invokeStartTime;

      console.log(`Edge function call completed in ${invokeDuration}ms`);
      console.log('Raw edge function response:', { data, error });

      if (error) {
        console.error('=== EDGE FUNCTION ERROR ===');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        console.error('Error code:', error.code);
        throw new Error(`Edge function failed: ${error.message || JSON.stringify(error)}`);
      }

      console.log('=== EDGE FUNCTION SUCCESS ===');
      console.log('Response data:', data);

      if (data && data.success) {
        const totalDuration = Date.now() - startTime;
        console.log(`✅ Total operation completed in ${totalDuration}ms`);
        
        toast({
          title: "Sucesso",
          description: `Webhook enviado com sucesso! Agent ID: ${data.webhook?.agent_id}, Tab: ${data.webhook?.tab_name}, Duration: ${totalDuration}ms`
        });
      } else if (data && !data.success) {
        console.error('=== WEBHOOK FAILURE ===');
        console.error('Failure details:', data);
        throw new Error(data.error || data.details || 'Webhook failed without specific error');
      } else {
        console.error('=== UNEXPECTED RESPONSE FORMAT ===');
        console.error('Unexpected response:', data);
        throw new Error('Unexpected response format from edge function');
      }

    } catch (error) {
      const totalDuration = Date.now() - startTime;
      console.error('=== FRONTEND ERROR ===');
      console.error(`❌ Error after ${totalDuration}ms:`, error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      toast({
        title: "Erro",
        description: `Erro ao enviar webhook: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      const totalDuration = Date.now() - startTime;
      console.log(`=== FRONTEND OPERATION COMPLETED (${totalDuration}ms) ===`);
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
                <Label className="text-white">Webhook Configuration</Label>
                <p className="text-sm text-neutral-400">
                  Agent ID: <span className="text-white font-mono">AGENT_ID_CONSTANT</span>
                </p>
                <p className="text-sm text-neutral-400">
                  Tab Name: <span className="text-white font-mono">invisible_structure</span>
                </p>
                <p className="text-sm text-neutral-400">
                  URL: <span className="text-white font-mono text-xs">https://webhook-automatios-rsmtk.abbadigital.com.br/webhook/rag-rs-copy-estrutura-invisivel</span>
                </p>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Enviando Webhook...' : 'Enviar Webhook'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
