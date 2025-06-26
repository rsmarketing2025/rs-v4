
-- Criar tabela para configurações gerais do agente
CREATE TABLE public.agent_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  agent_name text NOT NULL DEFAULT 'Copy Chief',
  agent_description text,
  default_language text NOT NULL DEFAULT 'pt-BR',
  voice_tone text NOT NULL DEFAULT 'formal',
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Criar tabela para arquivos de treinamento
CREATE TABLE public.agent_training_files (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_url text,
  file_content text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Criar tabela para links de referência
CREATE TABLE public.agent_reference_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  link_title text NOT NULL,
  link_url text NOT NULL,
  link_description text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Criar tabela para contextos manuais
CREATE TABLE public.agent_manual_contexts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  context_title text NOT NULL,
  context_content text NOT NULL,
  tags text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Criar tabela para configurações de comportamento
CREATE TABLE public.agent_behavior_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  prohibited_words text[] DEFAULT '{}',
  default_responses jsonb DEFAULT '{}',
  fallback_message text DEFAULT 'Desculpe, não consegui entender sua pergunta. Pode reformular?',
  response_examples text[] DEFAULT '{}',
  max_response_length integer DEFAULT 1000,
  preferred_format text DEFAULT 'text',
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Criar tabela para fluxos de conversa
CREATE TABLE public.agent_conversation_flows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  flow_name text NOT NULL,
  flow_description text,
  flow_steps jsonb NOT NULL DEFAULT '[]',
  conditions jsonb DEFAULT '{}',
  escalation_rules jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Criar tabela para feedback de usuários
CREATE TABLE public.agent_user_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL,
  message_id uuid,
  user_id uuid,
  feedback_type text NOT NULL, -- 'thumbs_up', 'thumbs_down', 'rating', 'comment'
  feedback_value text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comments text,
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Habilitar RLS para todas as tabelas
ALTER TABLE public.agent_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_training_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_reference_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_manual_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_behavior_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_user_feedback ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para agent_configurations
CREATE POLICY "Users can view their own agent configurations"
  ON public.agent_configurations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent configurations"
  ON public.agent_configurations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent configurations"
  ON public.agent_configurations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent configurations"
  ON public.agent_configurations FOR DELETE
  USING (auth.uid() = user_id);

-- Criar políticas RLS para agent_training_files
CREATE POLICY "Users can view their own training files"
  ON public.agent_training_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training files"
  ON public.agent_training_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training files"
  ON public.agent_training_files FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training files"
  ON public.agent_training_files FOR DELETE
  USING (auth.uid() = user_id);

-- Criar políticas RLS para agent_reference_links
CREATE POLICY "Users can view their own reference links"
  ON public.agent_reference_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reference links"
  ON public.agent_reference_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reference links"
  ON public.agent_reference_links FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reference links"
  ON public.agent_reference_links FOR DELETE
  USING (auth.uid() = user_id);

-- Criar políticas RLS para agent_manual_contexts
CREATE POLICY "Users can view their own manual contexts"
  ON public.agent_manual_contexts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own manual contexts"
  ON public.agent_manual_contexts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own manual contexts"
  ON public.agent_manual_contexts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own manual contexts"
  ON public.agent_manual_contexts FOR DELETE
  USING (auth.uid() = user_id);

-- Criar políticas RLS para agent_behavior_settings
CREATE POLICY "Users can view their own behavior settings"
  ON public.agent_behavior_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own behavior settings"
  ON public.agent_behavior_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own behavior settings"
  ON public.agent_behavior_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own behavior settings"
  ON public.agent_behavior_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Criar políticas RLS para agent_conversation_flows
CREATE POLICY "Users can view their own conversation flows"
  ON public.agent_conversation_flows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation flows"
  ON public.agent_conversation_flows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation flows"
  ON public.agent_conversation_flows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversation flows"
  ON public.agent_conversation_flows FOR DELETE
  USING (auth.uid() = user_id);

-- Criar políticas RLS para agent_user_feedback
CREATE POLICY "Users can view feedback for their conversations"
  ON public.agent_user_feedback FOR SELECT
  USING (auth.uid() = user_id OR conversation_id IN (
    SELECT id FROM public.agent_conversations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Anyone can create feedback"
  ON public.agent_user_feedback FOR INSERT
  WITH CHECK (true);

-- Criar triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_agent_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now() AT TIME ZONE 'America/Sao_Paulo';
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_configurations_updated_at
    BEFORE UPDATE ON public.agent_configurations
    FOR EACH ROW EXECUTE FUNCTION public.update_agent_updated_at_column();

CREATE TRIGGER update_agent_training_files_updated_at
    BEFORE UPDATE ON public.agent_training_files
    FOR EACH ROW EXECUTE FUNCTION public.update_agent_updated_at_column();

CREATE TRIGGER update_agent_reference_links_updated_at
    BEFORE UPDATE ON public.agent_reference_links
    FOR EACH ROW EXECUTE FUNCTION public.update_agent_updated_at_column();

CREATE TRIGGER update_agent_manual_contexts_updated_at
    BEFORE UPDATE ON public.agent_manual_contexts
    FOR EACH ROW EXECUTE FUNCTION public.update_agent_updated_at_column();

CREATE TRIGGER update_agent_behavior_settings_updated_at
    BEFORE UPDATE ON public.agent_behavior_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_agent_updated_at_column();

CREATE TRIGGER update_agent_conversation_flows_updated_at
    BEFORE UPDATE ON public.agent_conversation_flows
    FOR EACH ROW EXECUTE FUNCTION public.update_agent_updated_at_column();
