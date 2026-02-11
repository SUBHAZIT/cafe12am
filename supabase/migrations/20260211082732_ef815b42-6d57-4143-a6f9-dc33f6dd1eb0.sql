-- Allow delivery partners to view customer and merchant profiles for their assigned orders
CREATE POLICY "Delivery partners view order profiles"
ON public.profiles
FOR SELECT
USING (
  is_delivery_partner(auth.uid()) AND (
    id IN (
      SELECT o.customer_id FROM orders o
      JOIN delivery_assignments da ON da.order_id = o.id
      WHERE da.delivery_partner_id IN (
        SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
      )
    )
    OR
    id IN (
      SELECT o.merchant_id FROM orders o
      JOIN delivery_assignments da ON da.order_id = o.id
      WHERE da.delivery_partner_id IN (
        SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
      )
    )
  )
);

-- Also allow delivery partners to view order_items for their assigned orders
CREATE POLICY "Delivery partners view order items"
ON public.order_items
FOR SELECT
USING (
  order_id IN (
    SELECT da.order_id FROM delivery_assignments da
    WHERE da.delivery_partner_id IN (
      SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
    )
  )
);