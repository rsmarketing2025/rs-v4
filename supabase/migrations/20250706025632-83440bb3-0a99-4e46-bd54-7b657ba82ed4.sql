-- Remove duplicate records, keeping only the most recent one for each (user_id, tab_name, data_type) combination
DELETE FROM public.agent_training_data 
WHERE ctid NOT IN (
    SELECT DISTINCT ON (user_id, tab_name, data_type) ctid
    FROM public.agent_training_data 
    ORDER BY user_id, tab_name, data_type, created_at DESC
);

-- Now add the unique constraint
ALTER TABLE public.agent_training_data 
ADD CONSTRAINT agent_training_data_user_tab_type_unique 
UNIQUE (user_id, tab_name, data_type);