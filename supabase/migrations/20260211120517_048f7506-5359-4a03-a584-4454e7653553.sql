
-- Create a function to auto-assign delivery partner when order becomes ready
CREATE OR REPLACE FUNCTION public.auto_assign_delivery_partner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _partner_id uuid;
BEGIN
  -- Only trigger when status changes to ready_for_pickup
  IF NEW.status = 'ready_for_pickup' AND (OLD.status IS NULL OR OLD.status != 'ready_for_pickup') THEN
    -- Find an online delivery partner
    SELECT partner_id INTO _partner_id
    FROM delivery_partner_settings
    WHERE is_online = true
    LIMIT 1;
    
    IF _partner_id IS NOT NULL THEN
      -- Check if assignment doesn't already exist
      IF NOT EXISTS (SELECT 1 FROM delivery_assignments WHERE order_id = NEW.id) THEN
        INSERT INTO delivery_assignments (order_id, delivery_partner_id, status)
        VALUES (NEW.id, _partner_id, 'assigned');
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_auto_assign_delivery ON public.orders;
CREATE TRIGGER trigger_auto_assign_delivery
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_delivery_partner();

-- Also fix: allow delivery partners to SELECT delivery_partner_settings to see online status
-- (already exists, just ensuring)

-- Fix existing orphaned orders: create assignments for orders that are ready/rider_assigned but have no assignment
INSERT INTO delivery_assignments (order_id, delivery_partner_id, status)
SELECT o.id, 'd539ab48-2532-4e28-b6c2-9d334e28671f', 'assigned'
FROM orders o
WHERE o.status IN ('ready_for_pickup', 'rider_assigned')
AND o.id NOT IN (SELECT order_id FROM delivery_assignments)
LIMIT 20;
