
CREATE POLICY "Merchants can create categories"
ON public.categories FOR INSERT
TO authenticated
WITH CHECK (is_merchant(auth.uid()));
