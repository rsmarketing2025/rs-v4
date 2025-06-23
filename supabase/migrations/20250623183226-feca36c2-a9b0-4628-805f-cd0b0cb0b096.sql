
-- Renomear a coluna status para subscription_status na tabela subscription_status
ALTER TABLE public.subscription_status 
RENAME COLUMN status TO subscription_status;

-- Atualizar a constraint de check para usar o novo nome da coluna
ALTER TABLE public.subscription_status 
DROP CONSTRAINT IF EXISTS subscription_status_status_check;

ALTER TABLE public.subscription_status 
ADD CONSTRAINT subscription_status_subscription_status_check 
CHECK (subscription_status IN ('active', 'canceled'));

-- Atualizar a função sync_subscription_status para usar o novo nome da coluna
CREATE OR REPLACE FUNCTION sync_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se subscription_id é válido
  IF NEW.subscription_id IS NULL OR NEW.subscription_id = '' OR NEW.subscription_id = '-' THEN
    RETURN NEW;
  END IF;

  -- Se for um evento de criação de assinatura
  IF NEW.event_type IN ('subscription', 'created', 'subscription_created') THEN
    INSERT INTO public.subscription_status (
      subscription_id, customer_id, customer_email, customer_name,
      plan, amount, currency, frequency, subscription_status, created_at, subscription_number
    ) VALUES (
      NEW.subscription_id, NEW.customer_id, NEW.customer_email, NEW.customer_name,
      NEW.plan, NEW.amount, NEW.currency, NEW.frequency, 'active', NEW.event_date, NEW.subscription_number
    )
    ON CONFLICT (subscription_id) DO UPDATE SET
      customer_email = NEW.customer_email,
      customer_name = NEW.customer_name,
      plan = NEW.plan,
      amount = NEW.amount,
      currency = NEW.currency,
      frequency = NEW.frequency,
      subscription_status = 'active',
      updated_at = NEW.event_date,
      canceled_at = NULL,
      subscription_number = NEW.subscription_number;
      
  -- Se for um evento de cancelamento
  ELSIF NEW.event_type IN ('canceled', 'cancelled', 'cancellation') THEN
    UPDATE public.subscription_status 
    SET 
      subscription_status = 'canceled',
      canceled_at = NEW.event_date,
      updated_at = NEW.event_date
    WHERE subscription_id = NEW.subscription_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Atualizar o índice se existir
DROP INDEX IF EXISTS idx_subscription_status_status;
CREATE INDEX idx_subscription_status_subscription_status ON public.subscription_status(subscription_status);
