import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization")!;

    // Verify the caller is an admin
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check admin role
    const { data: adminRole } = await adminClient.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!adminRole) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch all data in parallel
    const [rolesRes, profilesRes, bankRes, ordersRes, couponsRes, addressesRes, merchantSettingsRes, deliverySettingsRes] = await Promise.all([
      adminClient.from("user_roles").select("*"),
      adminClient.from("profiles").select("*"),
      adminClient.from("bank_details").select("*"),
      adminClient.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(100),
      adminClient.from("coupons").select("*").order("created_at", { ascending: false }),
      adminClient.from("saved_addresses").select("*"),
      adminClient.from("merchant_settings").select("*"),
      adminClient.from("delivery_partner_settings").select("*"),
    ]);

    // Build user map
    const profiles = profilesRes.data || [];
    const roles = rolesRes.data || [];
    const bankDetails = bankRes.data || [];
    const addresses = addressesRes.data || [];
    const merchantSettings = merchantSettingsRes.data || [];
    const deliverySettings = deliverySettingsRes.data || [];

    // Group by role
    const merchants: any[] = [];
    const riders: any[] = [];
    const customers: any[] = [];

    for (const role of roles) {
      const profile = profiles.find((p) => p.user_id === role.user_id);
      if (!profile) continue;

      const userBank = bankDetails.filter((b) => b.user_id === profile.id);
      const userAddresses = addresses.filter((a) => a.user_id === profile.id);

      const userData = {
        ...profile,
        role: role.role,
        bank_details: userBank,
        saved_addresses: userAddresses,
      };

      if (role.role === "merchant") {
        const settings = merchantSettings.find((s) => s.merchant_id === profile.id);
        merchants.push({ ...userData, merchant_settings: settings || null });
      } else if (role.role === "delivery_partner") {
        const settings = deliverySettings.find((s) => s.partner_id === profile.id);
        riders.push({ ...userData, delivery_settings: settings || null });
      } else if (role.role === "customer") {
        customers.push(userData);
      }
    }

    return new Response(
      JSON.stringify({
        merchants,
        riders,
        customers,
        orders: ordersRes.data || [],
        coupons: couponsRes.data || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
