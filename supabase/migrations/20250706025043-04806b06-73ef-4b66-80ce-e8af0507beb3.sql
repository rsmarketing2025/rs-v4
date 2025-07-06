-- Add unique constraint to agent_training_data table to support upsert operations
ALTER TABLE public.agent_training_data 
ADD CONSTRAINT agent_training_data_user_tab_type_unique 
UNIQUE (user_id, tab_name, data_type);