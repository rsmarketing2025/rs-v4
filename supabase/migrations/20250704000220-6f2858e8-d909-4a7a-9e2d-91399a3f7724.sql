
-- Corrigir a função de atualização para usar timezone brasileiro
CREATE OR REPLACE FUNCTION public.update_subscription_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now() AT TIME ZONE 'America/Sao_Paulo';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Corrigir a função de atualização para subscription_renewals
CREATE OR REPLACE FUNCTION public.update_subscription_renewals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now() AT TIME ZONE 'America/Sao_Paulo';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para subscription_status se não existirem
DROP TRIGGER IF EXISTS trigger_update_subscription_status_updated_at ON public.subscription_status;
CREATE TRIGGER trigger_update_subscription_status_updated_at
    BEFORE UPDATE ON public.subscription_status
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_status_updated_at();

-- Criar triggers para subscription_renewals se não existirem
DROP TRIGGER IF EXISTS trigger_update_subscription_renewals_updated_at ON public.subscription_renewals;
CREATE TRIGGER trigger_update_subscription_renewals_updated_at
    BEFORE UPDATE ON public.subscription_renewals
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_renewals_updated_at();

-- Atualizar registros existentes para garantir consistência de timezone
UPDATE public.subscription_status 
SET updated_at = COALESCE(updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', now() AT TIME ZONE 'America/Sao_Paulo')
WHERE updated_at IS NOT NULL;

UPDATE public.subscription_renewals 
SET updated_at = COALESCE(updated_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', now() AT TIME ZONE 'America/Sao_Paulo')
WHERE updated_at IS NOT NULL;
