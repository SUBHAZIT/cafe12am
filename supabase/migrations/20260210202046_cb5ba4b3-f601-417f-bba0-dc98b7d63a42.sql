
-- ============================================
-- CAFE12AM FOOD DELIVERY PLATFORM SCHEMA
-- ============================================

-- 1. ROLE ENUM & USER ROLES TABLE
CREATE TYPE public.app_role AS ENUM ('admin', 'merchant', 'delivery_partner', 'customer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. SECURITY DEFINER HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.is_merchant(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'merchant')
$$;

CREATE OR REPLACE FUNCTION public.is_delivery_partner(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'delivery_partner')
$$;

CREATE OR REPLACE FUNCTION public.is_customer(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'customer')
$$;

-- 3. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. CATEGORIES TABLE
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 5. MENU ITEMS TABLE
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_veg BOOLEAN NOT NULL DEFAULT false,
  preparation_time_mins INT NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- 6. CART ITEMS TABLE
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  special_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- 7. COUPONS TABLE
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' or 'flat'
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(10,2),
  usage_limit INT,
  used_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 8. ORDERS TABLE
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  merchant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'placed',
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  delivery_address TEXT NOT NULL,
  delivery_notes TEXT,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  delivery_otp TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 9. ORDER ITEMS TABLE
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  special_instructions TEXT
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 10. DELIVERY ASSIGNMENTS TABLE
CREATE TABLE public.delivery_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  delivery_partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned',
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;

-- 11. BANK DETAILS TABLE
CREATE TABLE public.bank_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  account_holder_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  upi_id TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bank_details ENABLE ROW LEVEL SECURITY;

-- 12. PAYOUTS TABLE
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- 13. RATINGS TABLE
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- 14. MERCHANT SETTINGS TABLE
CREATE TABLE public.merchant_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  store_name TEXT NOT NULL DEFAULT 'My Store',
  store_description TEXT,
  is_open BOOLEAN NOT NULL DEFAULT false,
  opening_time TIME NOT NULL DEFAULT '21:00',
  closing_time TIME NOT NULL DEFAULT '02:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.merchant_settings ENABLE ROW LEVEL SECURITY;

-- 15. DELIVERY PARTNER SETTINGS TABLE
CREATE TABLE public.delivery_partner_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_online BOOLEAN NOT NULL DEFAULT false,
  current_lat NUMERIC(10,7),
  current_lng NUMERIC(10,7),
  vehicle_type TEXT DEFAULT 'bike',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_partner_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- UPDATE TIMESTAMP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bank_details_updated_at BEFORE UPDATE ON public.bank_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_merchant_settings_updated_at BEFORE UPDATE ON public.merchant_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_partner_settings_updated_at BEFORE UPDATE ON public.delivery_partner_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.phone,
    NEW.email
  );
  -- Auto-assign customer role for self-signups
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ORDER NUMBER GENERATION
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'C12AM-' || to_char(now(), 'YYYYMMDD') || '-' || substr(NEW.id::text, 1, 6);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_order_number BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- ============================================
-- RLS POLICIES
-- ============================================

-- user_roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.is_admin(auth.uid()));

-- profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins full access profiles" ON public.profiles FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Customers can view merchant profiles" ON public.profiles FOR SELECT USING (
  public.is_customer(auth.uid()) AND public.is_merchant(user_id)
);

-- categories policies
CREATE POLICY "Anyone authenticated can view categories" ON public.categories FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (public.is_admin(auth.uid()));

-- menu_items policies
CREATE POLICY "Anyone authenticated can view available items" ON public.menu_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Merchants manage own items" ON public.menu_items FOR INSERT WITH CHECK (public.is_merchant(auth.uid()) AND merchant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Merchants update own items" ON public.menu_items FOR UPDATE USING (merchant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Merchants delete own items" ON public.menu_items FOR DELETE USING (merchant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage all items" ON public.menu_items FOR ALL USING (public.is_admin(auth.uid()));

-- cart_items policies
CREATE POLICY "Customers manage own cart" ON public.cart_items FOR ALL USING (customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage all carts" ON public.cart_items FOR ALL USING (public.is_admin(auth.uid()));

-- coupons policies
CREATE POLICY "Authenticated can view active coupons" ON public.coupons FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL USING (public.is_admin(auth.uid()));

-- orders policies
CREATE POLICY "Customers view own orders" ON public.orders FOR SELECT USING (customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Customers create orders" ON public.orders FOR INSERT WITH CHECK (customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Merchants view their orders" ON public.orders FOR SELECT USING (merchant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Merchants update their orders" ON public.orders FOR UPDATE USING (merchant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Delivery partners view assigned orders" ON public.orders FOR SELECT USING (
  id IN (SELECT order_id FROM public.delivery_assignments WHERE delivery_partner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Admins manage all orders" ON public.orders FOR ALL USING (public.is_admin(auth.uid()));

-- order_items policies
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  OR order_id IN (SELECT id FROM public.orders WHERE merchant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Customers create order items" ON public.order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE customer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
);
CREATE POLICY "Admins manage all order items" ON public.order_items FOR ALL USING (public.is_admin(auth.uid()));

-- delivery_assignments policies
CREATE POLICY "Partners view own assignments" ON public.delivery_assignments FOR SELECT USING (delivery_partner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Partners update own assignments" ON public.delivery_assignments FOR UPDATE USING (delivery_partner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage assignments" ON public.delivery_assignments FOR ALL USING (public.is_admin(auth.uid()));

-- bank_details policies
CREATE POLICY "Users view own bank details" ON public.bank_details FOR SELECT USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own bank details" ON public.bank_details FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users update own bank details" ON public.bank_details FOR UPDATE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage all bank details" ON public.bank_details FOR ALL USING (public.is_admin(auth.uid()));

-- payouts policies
CREATE POLICY "Recipients view own payouts" ON public.payouts FOR SELECT USING (recipient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage payouts" ON public.payouts FOR ALL USING (public.is_admin(auth.uid()));

-- ratings policies
CREATE POLICY "Anyone can view ratings" ON public.ratings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Customers create ratings" ON public.ratings FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Users update own ratings" ON public.ratings FOR UPDATE USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage ratings" ON public.ratings FOR ALL USING (public.is_admin(auth.uid()));

-- merchant_settings policies
CREATE POLICY "Anyone can view merchant settings" ON public.merchant_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Merchants manage own settings" ON public.merchant_settings FOR ALL USING (merchant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage all merchant settings" ON public.merchant_settings FOR ALL USING (public.is_admin(auth.uid()));

-- delivery_partner_settings policies
CREATE POLICY "Partners manage own settings" ON public.delivery_partner_settings FOR ALL USING (partner_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins manage all partner settings" ON public.delivery_partner_settings FOR ALL USING (public.is_admin(auth.uid()));

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_assignments;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_menu_items_merchant_id ON public.menu_items(merchant_id);
CREATE INDEX idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX idx_cart_items_customer_id ON public.cart_items(customer_id);
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_merchant_id ON public.orders(merchant_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_delivery_assignments_order_id ON public.delivery_assignments(order_id);
CREATE INDEX idx_delivery_assignments_partner_id ON public.delivery_assignments(delivery_partner_id);
CREATE INDEX idx_bank_details_user_id ON public.bank_details(user_id);
CREATE INDEX idx_payouts_recipient_id ON public.payouts(recipient_id);
CREATE INDEX idx_ratings_order_id ON public.ratings(order_id);

-- ============================================
-- STORAGE BUCKET FOR FOOD IMAGES
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('food-images', 'food-images', true);

CREATE POLICY "Anyone can view food images" ON storage.objects FOR SELECT USING (bucket_id = 'food-images');
CREATE POLICY "Merchants can upload food images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'food-images' AND auth.role() = 'authenticated');
CREATE POLICY "Merchants can update food images" ON storage.objects FOR UPDATE USING (bucket_id = 'food-images' AND auth.role() = 'authenticated');
CREATE POLICY "Merchants can delete food images" ON storage.objects FOR DELETE USING (bucket_id = 'food-images' AND auth.role() = 'authenticated');
