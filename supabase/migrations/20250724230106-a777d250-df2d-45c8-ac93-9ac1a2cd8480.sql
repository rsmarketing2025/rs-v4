-- Ensure the agent-training-files bucket exists and has proper policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('agent-training-files', 'agent-training-files', true)
ON CONFLICT (id) DO UPDATE SET 
  public = true;

-- Create storage policies for the agent-training-files bucket
CREATE POLICY "Authenticated users can upload files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'agent-training-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'agent-training-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'agent-training-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'agent-training-files' AND auth.uid()::text = (storage.foldername(name))[1]);