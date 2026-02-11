-- Drop the recursive policy causing infinite recursion
DROP POLICY IF EXISTS "Delivery partners view order profiles" ON public.profiles;

-- Create a security definer function to get delivery partner's profile id without hitting RLS
CREATE OR REPLACE FUNCTION public.get_profile_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Create a security definer function to get order customer/merchant ids for a delivery partner
CREATE OR REPLACE FUNCTION public.get_delivery_partner_order_profile_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT unnest(ARRAY[o.customer_id, o.merchant_id])
  FROM orders o
  JOIN delivery_assignments da ON da.order_id = o.id
  WHERE da.delivery_partner_id = (SELECT id FROM profiles WHERE user_id = _user_id LIMIT 1)
$$;

-- Recreate policy using security definer function (no recursion)
CREATE POLICY "Delivery partners view order profiles"
ON public.profiles
FOR SELECT
USING (
  is_delivery_partner(auth.uid()) AND 
  id IN (SELECT public.get_delivery_partner_order_profile_ids(auth.uid()))
);