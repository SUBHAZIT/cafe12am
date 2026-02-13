import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CASHFREE_APP_ID = Deno.env.get('CASHFREE_APP_ID');
    const CASHFREE_SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY');

    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY) {
      throw new Error('Cashfree credentials not configured');
    }

    const { order_id } = await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ error: 'Missing order_id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Query Cashfree for the order status
    const cashfreeUrl = CASHFREE_APP_ID.startsWith('TEST')
      ? `https://sandbox.cashfree.com/pg/orders/${order_id}`
      : `https://api.cashfree.com/pg/orders/${order_id}`;

    const response = await fetch(cashfreeUrl, {
      method: 'GET',
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
      },
    });

    const data = await response.json();
    console.log('Cashfree order status response:', JSON.stringify(data));

    if (!response.ok) {
      throw new Error(`Cashfree API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    const cfOrderStatus = data.order_status; // PAID, ACTIVE, EXPIRED, TERMINATED

    // Update DB based on verified status
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let paymentStatus = 'processing';
    let dbUpdate: Record<string, string> = {};

    if (cfOrderStatus === 'PAID') {
      paymentStatus = 'paid';
      dbUpdate = { payment_status: 'paid', status: 'placed' };
    } else if (cfOrderStatus === 'ACTIVE') {
      paymentStatus = 'processing';
      dbUpdate = { payment_status: 'processing' };
    } else if (cfOrderStatus === 'EXPIRED' || cfOrderStatus === 'TERMINATED') {
      paymentStatus = 'failed';
      dbUpdate = { payment_status: 'failed', status: 'cancelled' };
    } else {
      dbUpdate = { payment_status: 'processing' };
    }

    const { error } = await supabase
      .from('orders')
      .update(dbUpdate)
      .eq('order_number', order_id);

    if (error) {
      console.error('Error updating order:', error);
    }

    console.log(`Order ${order_id} verified: CF status=${cfOrderStatus}, DB payment_status=${paymentStatus}`);

    return new Response(JSON.stringify({
      payment_status: paymentStatus,
      cf_order_status: cfOrderStatus,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error verifying payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
