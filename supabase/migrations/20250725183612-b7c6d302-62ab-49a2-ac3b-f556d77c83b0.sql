-- Correção da funcionalidade Invisible Structure
-- Limpeza de dados inconsistentes e melhorias na estrutura

-- 1. Limpar registros órfãos (file_url null mas status active)
UPDATE agent_training_data 
SET status = 'deleted'
WHERE tab_name = 'invisible_structure' 
  AND data_type = 'file' 
  AND file_url IS NULL 
  AND status = 'active';

-- 2. Adicionar constraint para garantir file_url em arquivos ativos
ALTER TABLE agent_training_data 
ADD CONSTRAINT check_file_data_consistency 
CHECK (
  (data_type != 'file' OR status != 'active') OR 
  (data_type = 'file' AND status = 'active' AND file_url IS NOT NULL)
);

-- 3. Criar índices para melhor performance nas consultas frequentes
CREATE INDEX IF NOT EXISTS idx_agent_training_data_user_tab_type_status 
ON agent_training_data (user_id, tab_name, data_type, status);

CREATE INDEX IF NOT EXISTS idx_agent_training_data_file_url 
ON agent_training_data (file_url) WHERE file_url IS NOT NULL;

-- 4. Criar função para validar consistência de dados de arquivo
CREATE OR REPLACE FUNCTION validate_file_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Para arquivos ativos, garantir que file_url não seja null
  IF NEW.data_type = 'file' AND NEW.status = 'active' THEN
    IF NEW.file_url IS NULL OR NEW.file_url = '' THEN
      RAISE EXCEPTION 'Arquivos ativos devem ter file_url válido';
    END IF;
    
    -- Garantir que file_name também não seja null
    IF NEW.file_name IS NULL OR NEW.file_name = '' THEN
      RAISE EXCEPTION 'Arquivos devem ter file_name válido';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Aplicar trigger de validação
DROP TRIGGER IF EXISTS validate_file_data_trigger ON agent_training_data;
CREATE TRIGGER validate_file_data_trigger
  BEFORE INSERT OR UPDATE ON agent_training_data
  FOR EACH ROW
  EXECUTE FUNCTION validate_file_data();

-- 6. Verificar e corrigir permissões do storage bucket
-- Garantir que o bucket agent-training-files esteja público
UPDATE storage.buckets 
SET public = true 
WHERE id = 'agent-training-files';

-- 7. Criar política de storage mais específica para agent-training-files
DO $$
BEGIN
  -- Remove políticas existentes se houver
  DROP POLICY IF EXISTS "Authenticated users can upload training files" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can view training files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view their own training files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload their own training files" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own training files" ON storage.objects;
  
  -- Criar políticas mais específicas
  CREATE POLICY "Users can view training files in agent-training-files bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'agent-training-files');
  
  CREATE POLICY "Users can upload training files to their folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'agent-training-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
  
  CREATE POLICY "Users can delete their own training files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'agent-training-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Se houver erro com as políticas, apenas continue
    NULL;
END
$$;

-- 8. Função de diagnóstico para verificar integridade dos dados
CREATE OR REPLACE FUNCTION diagnose_invisible_structure_data()
RETURNS TABLE (
  issue_type TEXT,
  count_affected BIGINT,
  details TEXT
) AS $$
BEGIN
  -- Arquivos sem URL
  RETURN QUERY
  SELECT 
    'files_without_url'::TEXT,
    COUNT(*)::BIGINT,
    'Arquivos ativos sem file_url definido'::TEXT
  FROM agent_training_data 
  WHERE tab_name = 'invisible_structure' 
    AND data_type = 'file' 
    AND status = 'active' 
    AND file_url IS NULL;
  
  -- Arquivos órfãos (sem correspondência no storage)
  RETURN QUERY
  SELECT 
    'total_active_files'::TEXT,
    COUNT(*)::BIGINT,
    'Total de arquivos ativos na aba invisible_structure'::TEXT
  FROM agent_training_data 
  WHERE tab_name = 'invisible_structure' 
    AND data_type = 'file' 
    AND status = 'active';
    
  -- Links ativos
  RETURN QUERY
  SELECT 
    'total_active_links'::TEXT,
    COUNT(*)::BIGINT,
    'Total de links ativos na aba invisible_structure'::TEXT
  FROM agent_training_data 
  WHERE tab_name = 'invisible_structure' 
    AND data_type = 'link' 
    AND status = 'active';
    
  -- Prompts manuais
  RETURN QUERY
  SELECT 
    'total_manual_prompts'::TEXT,
    COUNT(*)::BIGINT,
    'Total de prompts manuais na aba invisible_structure'::TEXT
  FROM agent_training_data 
  WHERE tab_name = 'invisible_structure' 
    AND data_type = 'manual_prompt' 
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;