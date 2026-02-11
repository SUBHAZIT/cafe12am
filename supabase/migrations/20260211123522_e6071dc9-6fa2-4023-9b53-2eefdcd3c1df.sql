-- Allow delivery partners to update orders they are assigned to (for OTP and status updates)
CREATE POLICY "Delivery partners update assigned orders"
ON public.orders
FOR UPDATE
USING (
  id IN (
    SELECT da.order_id FROM delivery_assignments da
    WHERE da.delivery_partner_id IN (
      SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
    )
  )
);