import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature, x-webhook-timestamp',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload = await req.json();
    console.log('Cashfree webhook received:', JSON.stringify(payload));

    const { data } = payload;
    if (!data) {
      return new Response(JSON.stringify({ success: false, message: 'No data in payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { order } = data;
    if (!order) {
      return new Response(JSON.stringify({ success: false, message: 'No order in payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const orderId = order.order_id;
    const orderStatus = order.order_status; // PAID, ACTIVE, EXPIRED, etc.

    let paymentStatus = 'pending';
    let orderStatusUpdate: Record<string, string> = {};
    if (orderStatus === 'PAID') {
      paymentStatus = 'paid';
      orderStatusUpdate = { payment_status: 'paid', status: 'placed' };
    } else if (orderStatus === 'ACTIVE') {
      paymentStatus = 'processing';
      orderStatusUpdate = { payment_status: 'processing' };
    } else if (orderStatus === 'EXPIRED' || orderStatus === 'TERMINATED') {
      paymentStatus = 'failed';
      orderStatusUpdate = { payment_status: 'failed', status: 'cancelled' };
    } else {
      orderStatusUpdate = { payment_status: paymentStatus };
    }

    // Update order payment status and order status
    const { error } = await supabase
      .from('orders')
      .update(orderStatusUpdate)
      .eq('order_number', orderId);

    if (error) {
      console.error('Error updating order:', error);
    }

    console.log(`Order ${orderId} updated to payment_status: ${paymentStatus}`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
