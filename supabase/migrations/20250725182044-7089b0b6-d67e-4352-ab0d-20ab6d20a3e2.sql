-- Phase 1: Critical Security Fixes
-- Enable RLS on critical data tables and add role escalation protection

-- 1. Enable RLS on creative_insights table
ALTER TABLE public.creative_insights ENABLE ROW LEVEL SECURITY;

-- Create policies for creative_insights (restrict to admins and authorized users)
CREATE POLICY "Admins can view all creative insights" 
ON public.creative_insights 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage creative insights" 
ON public.creative_insights 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 2. Enable RLS on creative_sales table
ALTER TABLE public.creative_sales ENABLE ROW LEVEL SECURITY;

-- Create policies for creative_sales (restrict to admins and authorized users)
CREATE POLICY "Admins can view all creative sales" 
ON public.creative_sales 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage creative sales" 
ON public.creative_sales 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 3. Enable RLS on subscription_status table
ALTER TABLE public.subscription_status ENABLE ROW LEVEL SECURITY;

-- Create policies for subscription_status (restrict to admins and authorized users)
CREATE POLICY "Admins can view all subscription status" 
ON public.subscription_status 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage subscription status" 
ON public.subscription_status 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 4. Enable RLS on product_sales table  
ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;

-- Create policies for product_sales (restrict to admins and authorized users)
CREATE POLICY "Admins can view all product sales" 
ON public.product_sales 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage product sales" 
ON public.product_sales 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- 5. Add role escalation protection
-- Create function to prevent users from escalating their own privileges
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from changing their own role to admin or moderator
  IF TG_OP = 'UPDATE' THEN
    -- Only allow role changes by existing admins
    IF OLD.user_id = auth.uid() AND NEW.role != OLD.role THEN
      -- Check if current user is admin
      IF get_current_user_role() != 'admin' THEN
        RAISE EXCEPTION 'You cannot change your own role. Contact an administrator.';
      END IF;
    END IF;
  END IF;
  
  -- For INSERT operations, prevent non-admins from creating admin/moderator roles
  IF TG_OP = 'INSERT' THEN
    IF NEW.role IN ('admin', 'moderator') AND get_current_user_role() != 'admin' THEN
      RAISE EXCEPTION 'Only administrators can assign admin or moderator roles.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply the trigger to user_roles table
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.user_roles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 6. Add additional security function for checking data access permissions
CREATE OR REPLACE FUNCTION public.can_access_sales_data()
RETURNS BOOLEAN AS $$
BEGIN
  -- Only admins and users with specific chart permissions can access sales data
  RETURN get_current_user_role() = 'admin' OR 
         EXISTS (
           SELECT 1 FROM public.user_chart_permissions 
           WHERE user_id = auth.uid() 
           AND chart_type IN ('sales_chart', 'sales_summary_cards')
           AND can_access = true
         );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 7. Update subscription_events policies to be more restrictive
-- Drop existing permissive policies and create more secure ones
DROP POLICY IF EXISTS "Authenticated users can view subscription events" ON public.subscription_events;
DROP POLICY IF EXISTS "Authenticated users can insert subscription events" ON public.subscription_events;

-- Create more restrictive policies for subscription_events
CREATE POLICY "Admins can view all subscription events" 
ON public.subscription_events 
FOR SELECT 
USING (get_current_user_role() = 'admin');

CREATE POLICY "System can insert subscription events" 
ON public.subscription_events 
FOR INSERT 
WITH CHECK (get_current_user_role() = 'admin' OR auth.jwt() ->> 'role' = 'service_role');

-- 8. Create audit function for role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log role changes for security auditing
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO public.audit_log (
      user_id, 
      action, 
      table_name, 
      old_values, 
      new_values, 
      performed_by,
      performed_at
    ) VALUES (
      NEW.user_id,
      'role_change',
      'user_roles',
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role),
      auth.uid(),
      now()
    );
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Continue operation even if audit fails
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  table_name text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  performed_by uuid,
  performed_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" 
ON public.audit_log 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- Apply audit trigger to user_roles
DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.user_roles;
CREATE TRIGGER audit_role_changes_trigger
  AFTER UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();