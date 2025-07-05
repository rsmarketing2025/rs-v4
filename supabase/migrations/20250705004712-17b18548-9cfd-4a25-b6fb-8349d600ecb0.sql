-- Add unique constraint on user_id and context_title for agent_manual_contexts table
-- This will allow the upsert operation to work correctly in InvisibleStructureTab

ALTER TABLE public.agent_manual_contexts 
ADD CONSTRAINT agent_manual_contexts_user_context_unique 
UNIQUE (user_id, context_title);