-- Check existing storage policies for agent-training-files bucket
SELECT 
  name,
  definition,
  permissive, 
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Create storage policies for the agent-training-files bucket if they don't exist
CREATE POLICY "Allow all authenticated users to upload files" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'agent-training-files');

CREATE POLICY "Allow all authenticated users to view files" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'agent-training-files');

CREATE POLICY "Allow all authenticated users to update files" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'agent-training-files');

CREATE POLICY "Allow all authenticated users to delete files" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'agent-training-files');