
-- Remover a tabela de permissões de gráficos
DROP TABLE IF EXISTS public.user_chart_permissions;

-- Atualizar a função handle_new_user para remover criação de chart permissions
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
  
  RETURN NEW;
END;
$function$;
