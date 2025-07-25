-- Add training_data_payload column to agent_configurations table
ALTER TABLE public.agent_configurations 
ADD COLUMN IF NOT EXISTS training_data_payload JSONB DEFAULT '{}'::jsonb;