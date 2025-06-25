
-- Create enum types for AI agent
CREATE TYPE agent_conversation_status AS ENUM ('active', 'archived');
CREATE TYPE agent_message_role AS ENUM ('user', 'assistant');
CREATE TYPE training_data_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Create conversations table
CREATE TABLE public.agent_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nova Conversa',
  status agent_conversation_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Create messages table
CREATE TABLE public.agent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.agent_conversations(id) ON DELETE CASCADE NOT NULL,
  role agent_message_role NOT NULL,
  content TEXT NOT NULL,
  webhook_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Create training data table
CREATE TABLE public.agent_training_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  status training_data_status NOT NULL DEFAULT 'pending',
  webhook_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Add Row Level Security (RLS)
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_training_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversations
CREATE POLICY "Users can view their own conversations" 
  ON public.agent_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
  ON public.agent_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
  ON public.agent_conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
  ON public.agent_conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for messages
CREATE POLICY "Users can view messages from their conversations" 
  ON public.agent_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.agent_conversations 
      WHERE id = agent_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations" 
  ON public.agent_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agent_conversations 
      WHERE id = agent_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Create RLS policies for training data
CREATE POLICY "Users can view their own training data" 
  ON public.agent_training_data 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own training data" 
  ON public.agent_training_data 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own training data" 
  ON public.agent_training_data 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training data" 
  ON public.agent_training_data 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_agent_conversations_user_id ON public.agent_conversations(user_id);
CREATE INDEX idx_agent_conversations_status ON public.agent_conversations(status);
CREATE INDEX idx_agent_messages_conversation_id ON public.agent_messages(conversation_id);
CREATE INDEX idx_agent_messages_created_at ON public.agent_messages(created_at);
CREATE INDEX idx_agent_training_data_user_id ON public.agent_training_data(user_id);
CREATE INDEX idx_agent_training_data_status ON public.agent_training_data(status);

-- Create triggers for updating updated_at columns
CREATE TRIGGER update_agent_conversations_updated_at
  BEFORE UPDATE ON public.agent_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_training_data_updated_at
  BEFORE UPDATE ON public.agent_training_data
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
