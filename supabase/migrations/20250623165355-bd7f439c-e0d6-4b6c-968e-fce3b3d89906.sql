
-- 1. Criar tabela subscription_status para armazenar o status atual de cada assinatura
CREATE TABLE public.subscription_status (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id text NOT NULL UNIQUE,
  customer_id text NOT NULL,
  customer_email text NOT NULL,
  customer_name text,
  plan text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  frequency text,
  status text NOT NULL CHECK (status IN ('active', 'canceled')),
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  canceled_at timestamp with time zone
);

-- 2. Criar índices para melhor performance
CREATE INDEX idx_subscription_status_status ON public.subscription_status(status);
CREATE INDEX idx_subscription_status_plan ON public.subscription_status(plan);
CREATE INDEX idx_subscription_status_customer_id ON public.subscription_status(customer_id);

-- 3. Migrar dados existentes para a nova tabela, tratando duplicatas
WITH subscription_data AS (
  SELECT 
    subscription_id,
    customer_id,
    customer_email,
    customer_name,
    plan,
    amount,
    currency,
    frequency,
    MIN(event_date) as created_at,
    -- Determinar status baseado no último evento
    CASE 
      WHEN MAX(CASE WHEN event_type IN ('canceled', 'cancelled', 'cancellation') THEN event_date END) IS NOT NULL
      THEN 'canceled'
      ELSE 'active'
    END as status,
    MAX(CASE WHEN event_type IN ('canceled', 'cancelled', 'cancellation') THEN event_date END) as canceled_at,
    -- Adicionar row_number para lidar com duplicatas
    ROW_NUMBER() OVER (PARTITION BY subscription_id ORDER BY MIN(event_date) DESC) as rn
  FROM subscription_events
  WHERE event_type IN ('subscription', 'created', 'subscription_created', 'canceled', 'cancelled', 'cancellation')
    AND subscription_id IS NOT NULL 
    AND subscription_id != ''
    AND subscription_id != '-'  -- Excluir subscription_id inválidos
  GROUP BY subscription_id, customer_id, customer_email, customer_name, plan, amount, currency, frequency
),
unique_subscriptions AS (
  SELECT 
    subscription_id, customer_id, customer_email, customer_name,
    plan, amount, currency, frequency, status, created_at, canceled_at
  FROM subscription_data
  WHERE rn = 1  -- Apenas a primeira ocorrência de cada subscription_id
)
INSERT INTO public.subscription_status (
  subscription_id, customer_id, customer_email, customer_name, 
  plan, amount, currency, frequency, status, created_at, canceled_at
)
SELECT 
  subscription_id, customer_id, customer_email, customer_name,
  plan, amount, currency, frequency, status, created_at, canceled_at
FROM unique_subscriptions;

-- 4. Criar função para sincronizar a tabela subscription_status
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
      plan, amount, currency, frequency, status, created_at
    ) VALUES (
      NEW.subscription_id, NEW.customer_id, NEW.customer_email, NEW.customer_name,
      NEW.plan, NEW.amount, NEW.currency, NEW.frequency, 'active', NEW.event_date
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
      canceled_at = NULL;
      
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

-- 5. Criar trigger para sincronização automática
CREATE TRIGGER trigger_sync_subscription_status
  AFTER INSERT ON public.subscription_events
  FOR EACH ROW
  EXECUTE FUNCTION sync_subscription_status();

-- 6. Adicionar campo payment_method à tabela subscription_events se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_events' 
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE public.subscription_events 
    ADD COLUMN payment_method text;
  END IF;
END $$;
