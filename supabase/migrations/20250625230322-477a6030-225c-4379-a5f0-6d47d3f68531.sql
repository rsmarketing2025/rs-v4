
-- Corrigir as políticas RLS para permitir que usuários autenticados salvem suas conversas e mensagens

-- Primeiro, vamos remover as políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.agent_conversations;
DROP POLICY IF EXISTS "Users can create their own conversations" ON public.agent_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON public.agent_conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON public.agent_conversations;

DROP POLICY IF EXISTS "Users can view messages from their conversations" ON public.agent_messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.agent_messages;

-- Recriar políticas mais permissivas para conversas
CREATE POLICY "Users can manage their own conversations" 
  ON public.agent_conversations 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Recriar políticas mais permissivas para mensagens
CREATE POLICY "Users can manage messages in their conversations" 
  ON public.agent_messages 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.agent_conversations 
      WHERE id = agent_messages.conversation_id 
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agent_conversations 
      WHERE id = agent_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );
