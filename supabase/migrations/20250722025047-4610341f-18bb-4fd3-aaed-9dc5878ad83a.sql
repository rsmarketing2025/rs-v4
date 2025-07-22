
-- Create table for chart permissions
CREATE TABLE public.user_chart_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  chart_id text NOT NULL,
  can_access boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at timestamp with time zone NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  UNIQUE(user_id, chart_id)
);

-- Enable RLS
ALTER TABLE public.user_chart_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own chart permissions" 
  ON public.user_chart_permissions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all chart permissions" 
  ON public.user_chart_permissions 
  FOR ALL 
  USING (get_current_user_role() = 'admin'::app_role);

-- Create trigger for updated_at
CREATE TRIGGER update_user_chart_permissions_updated_at
  BEFORE UPDATE ON public.user_chart_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to include default chart permissions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, email, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  
  -- Insert default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Insert default page permissions
  INSERT INTO public.user_page_permissions (user_id, page, can_access)
  VALUES 
    (NEW.id, 'creatives', true),
    (NEW.id, 'sales', true),
    (NEW.id, 'affiliates', true),
    (NEW.id, 'revenue', true),
    (NEW.id, 'users', false),
    (NEW.id, 'business-managers', true),
    (NEW.id, 'subscriptions', true),
    (NEW.id, 'kpis', true),
    (NEW.id, 'charts', true),
    (NEW.id, 'tables', true),
    (NEW.id, 'exports', true);
  
  -- Insert default chart permissions
  INSERT INTO public.user_chart_permissions (user_id, chart_id, can_access)
  VALUES 
    (NEW.id, 'kpi-total-investido', true),
    (NEW.id, 'kpi-receita', true),
    (NEW.id, 'kpi-ticket-medio', true),
    (NEW.id, 'kpi-total-pedidos', true),
    (NEW.id, 'grafico-performance-criativa', true),
    (NEW.id, 'grafico-vendas-criativas', true),
    (NEW.id, 'cards-resumo-vendas', true);
  
  RETURN NEW;
END;
$function$;
