
-- Criar tabela subscription_renewals para armazenar renovações de assinatura
CREATE TABLE public.subscription_renewals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id text NOT NULL,
  customer_id text NOT NULL,
  customer_email text NOT NULL,
  customer_name text,
  plan text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  frequency text,
  renewal_date timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  payment_method text,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'failed', 'pending', 'refunded')),
  gross_value numeric NOT NULL DEFAULT 0,
  net_value numeric NOT NULL DEFAULT 0,
  discount_value numeric DEFAULT 0,
  tax_value numeric DEFAULT 0,
  commission_value numeric DEFAULT 0,
  subscription_number integer,
  renewal_period_start timestamp with time zone,
  renewal_period_end timestamp with time zone,
  previous_renewal_id uuid REFERENCES public.subscription_renewals(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Criar índices para melhor performance
CREATE INDEX idx_subscription_renewals_subscription_id ON public.subscription_renewals(subscription_id);
CREATE INDEX idx_subscription_renewals_customer_id ON public.subscription_renewals(customer_id);
CREATE INDEX idx_subscription_renewals_renewal_date ON public.subscription_renewals(renewal_date);
CREATE INDEX idx_subscription_renewals_status ON public.subscription_renewals(status);
CREATE INDEX idx_subscription_renewals_plan ON public.subscription_renewals(plan);
CREATE INDEX idx_subscription_renewals_payment_method ON public.subscription_renewals(payment_method);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_subscription_renewals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now() AT TIME ZONE 'America/Sao_Paulo';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_subscription_renewals_updated_at
    BEFORE UPDATE ON public.subscription_renewals
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_renewals_updated_at();

-- Função para sincronizar renovações a partir de eventos de assinatura
CREATE OR REPLACE FUNCTION sync_subscription_renewals()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se é um evento de renovação
  IF NEW.event_type IN ('renewal', 'renewed', 'subscription_renewed', 'recurring_payment') THEN
    -- Verificar se subscription_id é válido
    IF NEW.subscription_id IS NOT NULL AND NEW.subscription_id != '' AND NEW.subscription_id != '-' THEN
      INSERT INTO public.subscription_renewals (
        subscription_id, customer_id, customer_email, customer_name,
        plan, amount, currency, frequency, renewal_date, payment_method,
        status, gross_value, net_value, subscription_number, metadata
      ) VALUES (
        NEW.subscription_id, NEW.customer_id, NEW.customer_email, NEW.customer_name,
        NEW.plan, NEW.amount, NEW.currency, NEW.frequency, NEW.event_date, NEW.payment_method,
        'completed', NEW.amount, NEW.amount, NEW.subscription_number, NEW.metadata
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para sincronização automática de renovações
CREATE TRIGGER trigger_sync_subscription_renewals
  AFTER INSERT ON public.subscription_events
  FOR EACH ROW
  EXECUTE FUNCTION sync_subscription_renewals();

-- Adicionar comentários para documentação
COMMENT ON TABLE public.subscription_renewals IS 'Tabela para armazenar renovações de assinatura separadamente das vendas regulares';
COMMENT ON COLUMN public.subscription_renewals.renewal_period_start IS 'Data de início do período de renovação';
COMMENT ON COLUMN public.subscription_renewals.renewal_period_end IS 'Data de fim do período de renovação';
COMMENT ON COLUMN public.subscription_renewals.previous_renewal_id IS 'Referência para a renovação anterior da mesma assinatura';
