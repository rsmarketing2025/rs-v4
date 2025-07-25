-- Check for existing duplicates before creating constraint
SELECT user_id, tab_name, data_type, COUNT(*) as count
FROM agent_training_data 
WHERE status = 'active'
GROUP BY user_id, tab_name, data_type 
HAVING COUNT(*) > 1;

-- If no duplicates exist, create the unique constraint
-- Note: This will fail if duplicates exist, which is what we want
ALTER TABLE agent_training_data 
ADD CONSTRAINT unique_user_tab_data_type 
UNIQUE (user_id, tab_name, data_type);