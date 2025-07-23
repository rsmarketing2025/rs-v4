-- Fix the handle_new_user trigger to avoid conflicts with edge function
-- The edge function will handle permissions, the trigger should only create the profile and default role

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Only create the basic profile - edge function will handle the rest
    INSERT INTO public.profiles (id, full_name, email, username, is_active)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        false
    );
    
    -- Only assign default user role - edge function will update this
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    -- Remove all permission insertions to avoid conflicts
    -- The edge function will handle all permissions
    
    RETURN NEW;
END;
$function$;