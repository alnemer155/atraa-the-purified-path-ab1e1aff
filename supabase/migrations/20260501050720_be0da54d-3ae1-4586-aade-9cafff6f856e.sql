CREATE POLICY "admin_wallpapers update by anyone"
ON public.admin_wallpapers
FOR UPDATE
USING (true)
WITH CHECK (true);