
-- Atualizar a tabela profiles para usar timezone do Brasil
ALTER TABLE public.profiles 
ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo');

ALTER TABLE public.profiles 
ALTER COLUMN updated_at SET DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo');

-- Atualizar a tabela user_roles para usar timezone do Brasil
ALTER TABLE public.user_roles 
ALTER COLUMN assigned_at SET DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo');

-- Criar ou atualizar trigger para profiles
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now() AT TIME ZONE 'America/Sao_Paulo';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para profiles se não existir
DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profiles_updated_at();

-- Atualizar registros existentes nas tabelas para garantir consistência
UPDATE public.profiles 
SET created_at = COALESCE(created_at, now() AT TIME ZONE 'America/Sao_Paulo'),
    updated_at = COALESCE(updated_at, now() AT TIME ZONE 'America/Sao_Paulo')
WHERE created_at IS NULL OR updated_at IS NULL;

UPDATE public.user_roles 
SET assigned_at = COALESCE(assigned_at, now() AT TIME ZONE 'America/Sao_Paulo')
WHERE assigned_at IS NULL;
