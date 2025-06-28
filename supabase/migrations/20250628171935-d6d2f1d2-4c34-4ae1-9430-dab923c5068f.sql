
-- First, let's drop the existing trigger and function to avoid conflicts
DROP TRIGGER IF EXISTS trigger_sync_subscription_renewals ON public.subscription_events;
DROP FUNCTION IF EXISTS sync_subscription_renewals();

-- Drop the existing subscription_renewals table to recreate it with the correct structure
DROP TABLE IF EXISTS public.subscription_renewals CASCADE;

-- Create the new subscription_renewals table with the same structure as subscription_status
CREATE TABLE public.subscription_renewals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id text,
  customer_id text,
  customer_email text,
  customer_name text,
  plan text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  frequency text,
  subscription_status text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  canceled_at timestamp with time zone,
  subscription_number integer
);

-- Create indices for better performance
CREATE INDEX idx_subscription_renewals_subscription_id ON public.subscription_renewals(subscription_id);
CREATE INDEX idx_subscription_renewals_customer_id ON public.subscription_renewals(customer_id);
CREATE INDEX idx_subscription_renewals_created_at ON public.subscription_renewals(created_at);
CREATE INDEX idx_subscription_renewals_status ON public.subscription_renewals(subscription_status);
CREATE INDEX idx_subscription_renewals_plan ON public.subscription_renewals(plan);

-- Create trigger for updated_at
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

-- Create new function to sync renewals from subscription_events
CREATE OR REPLACE FUNCTION sync_subscription_renewals()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process renewal events
  IF NEW.event_type IN ('renewal', 'renewed', 'subscription_renewed', 'recurring_payment') THEN
    -- Verify subscription_id is valid
    IF NEW.subscription_id IS NOT NULL AND NEW.subscription_id != '' AND NEW.subscription_id != '-' THEN
      INSERT INTO public.subscription_renewals (
        subscription_id, customer_id, customer_email, customer_name,
        plan, amount, currency, frequency, subscription_status, 
        created_at, subscription_number
      ) VALUES (
        NEW.subscription_id, NEW.customer_id, NEW.customer_email, NEW.customer_name,
        NEW.plan, NEW.amount, NEW.currency, NEW.frequency, 'active',
        NEW.event_date, NEW.subscription_number
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync renewals automatically
CREATE TRIGGER trigger_sync_subscription_renewals
  AFTER INSERT ON public.subscription_events
  FOR EACH ROW
  EXECUTE FUNCTION sync_subscription_renewals();

-- Populate the renewals table with existing data from subscription_events
INSERT INTO public.subscription_renewals (
  subscription_id, customer_id, customer_email, customer_name,
  plan, amount, currency, frequency, subscription_status,
  created_at, subscription_number
)
SELECT 
  subscription_id, customer_id, customer_email, customer_name,
  plan, amount, currency, frequency, 'active' as subscription_status,
  event_date, subscription_number
FROM public.subscription_events
WHERE event_type IN ('renewal', 'renewed', 'subscription_renewed', 'recurring_payment')
  AND subscription_id IS NOT NULL 
  AND subscription_id != '' 
  AND subscription_id != '-';

-- Add comments for documentation
COMMENT ON TABLE public.subscription_renewals IS 'Table to store subscription renewals with the same structure as subscription_status';
COMMENT ON COLUMN public.subscription_renewals.subscription_status IS 'Status of the renewal (active, canceled, etc.)';
COMMENT ON COLUMN public.subscription_renewals.canceled_at IS 'Timestamp when the renewal was canceled';
