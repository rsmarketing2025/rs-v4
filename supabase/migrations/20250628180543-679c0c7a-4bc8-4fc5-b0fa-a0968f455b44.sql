
-- Grant necessary permissions to anon and authenticated roles for subscription_renewals table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_renewals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_renewals TO authenticated;

-- Enable Row Level Security on subscription_renewals table
ALTER TABLE public.subscription_renewals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to allow public access (similar to other subscription tables)
-- This allows the application to insert/update/select data without user authentication requirements
CREATE POLICY "Allow all operations on subscription_renewals" 
ON public.subscription_renewals 
FOR ALL 
TO public 
USING (true) 
WITH CHECK (true);

-- Grant usage on the sequence if it exists (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
