-- Create unified agent training data table
CREATE TABLE public.agent_training_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tab_name TEXT NOT NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('file', 'link', 'manual_prompt')),
  
  -- File fields
  file_name TEXT,
  file_type TEXT,
  file_size BIGINT,
  file_url TEXT,
  file_content TEXT,
  
  -- Link fields
  link_title TEXT,
  link_url TEXT,
  link_description TEXT,
  
  -- Manual prompt field
  manual_prompt TEXT,
  
  -- General fields
  title TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Enable Row Level Security
ALTER TABLE public.agent_training_data ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
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

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_agent_training_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now() AT TIME ZONE 'America/Sao_Paulo';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_agent_training_data_updated_at
BEFORE UPDATE ON public.agent_training_data
FOR EACH ROW
EXECUTE FUNCTION public.update_agent_training_data_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_agent_training_data_user_tab ON public.agent_training_data(user_id, tab_name);
CREATE INDEX idx_agent_training_data_status ON public.agent_training_data(status);
CREATE INDEX idx_agent_training_data_type ON public.agent_training_data(data_type);