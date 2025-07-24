-- Check if storage policies already exist
SELECT policyname, tablename, cmd
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname LIKE '%agent-training-files%';

-- Create storage policies for the agent-training-files bucket
CREATE POLICY "Allow authenticated users to upload to agent-training-files" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'agent-training-files');

CREATE POLICY "Allow authenticated users to view agent-training-files" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'agent-training-files');

CREATE POLICY "Allow authenticated users to update agent-training-files" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'agent-training-files');

CREATE POLICY "Allow authenticated users to delete agent-training-files" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'agent-training-files');