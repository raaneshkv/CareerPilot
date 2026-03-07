-- Allow users to update their own roadmaps (for completion tracking)
CREATE POLICY "Users can update own roadmaps"
ON public.roadmaps
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);