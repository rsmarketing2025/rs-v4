
-- Adicionar coluna subscription_number à tabela subscription_status
ALTER TABLE public.subscription_status 
ADD COLUMN subscription_number integer;

-- Atualizar a função sync_subscription_status para incluir subscription_number
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
      plan, amount, currency, frequency, status, created_at, subscription_number
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
      status = 'active',
      updated_at = NEW.event_date,
      canceled_at = NULL,
      subscription_number = NEW.subscription_number;
      
  -- Se for um evento de cancelamento
  ELSIF NEW.event_type IN ('canceled', 'cancelled', 'cancellation') THEN
    UPDATE public.subscription_status 
    SET 
      status = 'canceled',
      canceled_at = NEW.event_date,
      updated_at = NEW.event_date
    WHERE subscription_id = NEW.subscription_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Atualizar os dados existentes com subscription_number da tabela subscription_events
UPDATE public.subscription_status 
SET subscription_number = se.subscription_number
FROM subscription_events se
WHERE subscription_status.subscription_id = se.subscription_id
  AND se.subscription_number IS NOT NULL;
