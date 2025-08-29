-- Create avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
CREATE POLICY "Give public access to avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[2]
  );

CREATE POLICY "Allow individual update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = (storage.foldername(name))[2])
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow individual delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = (storage.foldername(name))[2]); 