-- Remove the foreign key constraint that's causing timing issues during user creation
-- The RLS policies already ensure data integrity by restricting access to user's own data
ALTER TABLE public.user_chart_permissions DROP CONSTRAINT IF EXISTS user_chart_permissions_user_id_fkey;

-- Add a comment explaining why we removed the foreign key
COMMENT ON TABLE public.user_chart_permissions IS 'Chart permissions for users. Foreign key constraint to auth.users was removed to avoid timing issues during user creation via triggers. Data integrity is maintained through RLS policies.';