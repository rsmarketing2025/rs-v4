
-- Atualizar a tabela subscription_status para incluir valores padrão automáticos
-- e tornar created_at mais flexível

-- Primeiro, vamos atualizar a coluna created_at para ter um valor padrão
ALTER TABLE public.subscription_status 
ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo');

-- Garantir que a coluna updated_at tenha o valor padrão correto
ALTER TABLE public.subscription_status 
ALTER COLUMN updated_at SET DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo');

-- Criar ou atualizar o trigger para atualizar automaticamente updated_at
CREATE OR REPLACE FUNCTION update_subscription_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now() AT TIME ZONE 'America/Sao_Paulo';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS trigger_update_subscription_status_updated_at ON public.subscription_status;
CREATE TRIGGER trigger_update_subscription_status_updated_at
    BEFORE UPDATE ON public.subscription_status
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_status_updated_at();

-- Atualizar registros existentes que possam ter created_at NULL
UPDATE public.subscription_status 
SET created_at = updated_at 
WHERE created_at IS NULL;
