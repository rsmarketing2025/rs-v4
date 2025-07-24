-- Create storage bucket for agent training files
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-training-files', 'agent-training-files', true);

-- Create storage policies for agent training files
CREATE POLICY "Users can upload their own training files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'agent-training-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own training files"
ON storage.objects FOR SELECT
USING (bucket_id = 'agent-training-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own training files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'agent-training-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own training files"
ON storage.objects FOR DELETE
USING (bucket_id = 'agent-training-files' AND auth.uid()::text = (storage.foldername(name))[1]);