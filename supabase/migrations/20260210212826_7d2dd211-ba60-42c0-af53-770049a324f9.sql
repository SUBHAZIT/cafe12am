
-- Add time-based availability to menu_items
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS available_from time without time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS available_until time without time zone DEFAULT NULL;

-- Option groups per menu item (e.g., "Add Extras", "Choose Size")
CREATE TABLE public.option_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_required boolean NOT NULL DEFAULT false,
  max_selections integer DEFAULT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.option_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view option groups" ON public.option_groups FOR SELECT USING (true);
CREATE POLICY "Merchants manage own option groups" ON public.option_groups FOR INSERT WITH CHECK (
  menu_item_id IN (SELECT id FROM public.menu_items WHERE merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
);
CREATE POLICY "Merchants update own option groups" ON public.option_groups FOR UPDATE USING (
  menu_item_id IN (SELECT id FROM public.menu_items WHERE merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
);
CREATE POLICY "Merchants delete own option groups" ON public.option_groups FOR DELETE USING (
  menu_item_id IN (SELECT id FROM public.menu_items WHERE merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
);
CREATE POLICY "Admins manage all option groups" ON public.option_groups FOR ALL USING (is_admin(auth.uid()));

-- Option items within a group
CREATE TABLE public.option_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  option_group_id uuid NOT NULL REFERENCES public.option_groups(id) ON DELETE CASCADE,
  name text NOT NULL,
  additional_price numeric NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.option_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view option items" ON public.option_items FOR SELECT USING (true);
CREATE POLICY "Merchants manage own option items" ON public.option_items FOR INSERT WITH CHECK (
  option_group_id IN (SELECT og.id FROM option_groups og JOIN menu_items mi ON og.menu_item_id = mi.id WHERE mi.merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
);
CREATE POLICY "Merchants update own option items" ON public.option_items FOR UPDATE USING (
  option_group_id IN (SELECT og.id FROM option_groups og JOIN menu_items mi ON og.menu_item_id = mi.id WHERE mi.merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
);
CREATE POLICY "Merchants delete own option items" ON public.option_items FOR DELETE USING (
  option_group_id IN (SELECT og.id FROM option_groups og JOIN menu_items mi ON og.menu_item_id = mi.id WHERE mi.merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
);
CREATE POLICY "Admins manage all option items" ON public.option_items FOR ALL USING (is_admin(auth.uid()));

-- Item variants (size, type with different prices)
CREATE TABLE public.item_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.item_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view variants" ON public.item_variants FOR SELECT USING (true);
CREATE POLICY "Merchants manage own variants" ON public.item_variants FOR INSERT WITH CHECK (
  menu_item_id IN (SELECT id FROM public.menu_items WHERE merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
);
CREATE POLICY "Merchants update own variants" ON public.item_variants FOR UPDATE USING (
  menu_item_id IN (SELECT id FROM public.menu_items WHERE merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
);
CREATE POLICY "Merchants delete own variants" ON public.item_variants FOR DELETE USING (
  menu_item_id IN (SELECT id FROM public.menu_items WHERE merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
);
CREATE POLICY "Admins manage all variants" ON public.item_variants FOR ALL USING (is_admin(auth.uid()));

-- Combos
CREATE TABLE public.combos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.profiles(id),
  name text NOT NULL,
  description text,
  combo_price numeric NOT NULL DEFAULT 0,
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view combos" ON public.combos FOR SELECT USING (true);
CREATE POLICY "Merchants manage own combos" ON public.combos FOR INSERT WITH CHECK (
  is_merchant(auth.uid()) AND merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
);
CREATE POLICY "Merchants update own combos" ON public.combos FOR UPDATE USING (
  merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
);
CREATE POLICY "Merchants delete own combos" ON public.combos FOR DELETE USING (
  merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid())
);
CREATE POLICY "Admins manage all combos" ON public.combos FOR ALL USING (is_admin(auth.uid()));

-- Combo items (links menu items to combos)
CREATE TABLE public.combo_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  combo_id uuid NOT NULL REFERENCES public.combos(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.combo_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view combo items" ON public.combo_items FOR SELECT USING (true);
CREATE POLICY "Merchants manage own combo items" ON public.combo_items FOR INSERT WITH CHECK (
  combo_id IN (SELECT id FROM combos WHERE merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
);
CREATE POLICY "Merchants update own combo items" ON public.combo_items FOR UPDATE USING (
  combo_id IN (SELECT id FROM combos WHERE merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
);
CREATE POLICY "Merchants delete own combo items" ON public.combo_items FOR DELETE USING (
  combo_id IN (SELECT id FROM combos WHERE merchant_id IN (SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()))
);
CREATE POLICY "Admins manage all combo items" ON public.combo_items FOR ALL USING (is_admin(auth.uid()));

-- Add updated_at trigger for combos
CREATE TRIGGER update_combos_updated_at BEFORE UPDATE ON public.combos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.option_groups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.option_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.item_variants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.combos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.combo_items;
