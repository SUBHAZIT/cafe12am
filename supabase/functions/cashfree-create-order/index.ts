import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { order_id, order_amount, customer_name, customer_email, customer_phone, return_url } = await req.json();

    if (!order_id || !order_amount || !customer_phone) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cashfree TEST environment
    const cashfreeUrl = CASHFREE_APP_ID.startsWith('TEST')
      ? 'https://sandbox.cashfree.com/pg/orders'
      : 'https://api.cashfree.com/pg/orders';

    const response = await fetch(cashfreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify({
        order_id,
        order_amount: parseFloat(order_amount),
        order_currency: 'INR',
        customer_details: {
          customer_id: order_id,
          customer_name: customer_name || 'Customer',
          customer_email: customer_email || 'customer@cafe12am.com',
          customer_phone: customer_phone,
        },
        order_meta: {
          return_url: return_url || '',
          notify_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/cashfree-webhook`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree error:', JSON.stringify(data));
      throw new Error(`Cashfree API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({
      payment_session_id: data.payment_session_id,
      order_id: data.order_id,
      order_status: data.order_status,
      cf_order_id: data.cf_order_id,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error creating Cashfree order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
