-- Remove a constraint única que está impedindo múltiplos arquivos
ALTER TABLE agent_training_data 
DROP CONSTRAINT IF EXISTS unique_user_tab_data_type;

-- Esta constraint estava impedindo múltiplos uploads de arquivo
-- porque todos os arquivos têm data_type = 'file' para o mesmo usuário/aba