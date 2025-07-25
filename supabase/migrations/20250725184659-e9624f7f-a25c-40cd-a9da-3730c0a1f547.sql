-- Correção da funcionalidade Invisible Structure
-- Remove constraint única problemática e permite múltiplos arquivos por tab

-- 1. Remover a constraint única problemática que impede múltiplos arquivos
ALTER TABLE agent_training_data 
DROP CONSTRAINT IF EXISTS agent_training_data_user_tab_type_unique;

-- 2. Limpar registros inconsistentes que podem estar causando conflitos
-- Remove registros 'deleted' antigos que não deveriam estar sendo considerados
DELETE FROM agent_training_data 
WHERE status = 'deleted' 
  AND updated_at < NOW() - INTERVAL '30 days';

-- 3. Garantir que apenas registros ativos sejam considerados em futuras operações
-- Criar índice parcial apenas para registros ativos se necessário
CREATE INDEX IF NOT EXISTS idx_agent_training_data_active_records 
ON agent_training_data (user_id, tab_name, data_type) 
WHERE status = 'active';

-- 4. Verificar se existem registros duplicados problemáticos e removê-los
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (
           PARTITION BY user_id, tab_name, data_type, file_name 
           ORDER BY created_at DESC
         ) as rn
  FROM agent_training_data 
  WHERE status = 'active' 
    AND data_type = 'file'
    AND file_name IS NOT NULL
)
UPDATE agent_training_data 
SET status = 'deleted' 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);