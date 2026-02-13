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

    const webhookType = payload.type || '';
    const orderId = data.order?.order_id;
    const paymentStatus = data.payment?.payment_status; // "SUCCESS", "FAILED", "USER_DROPPED", "NOT_ATTEMPTED"

    if (!orderId) {
      return new Response(JSON.stringify({ success: false, message: 'No order_id in payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let dbUpdate: Record<string, string> = {};

    if (webhookType === 'PAYMENT_SUCCESS_WEBHOOK' || paymentStatus === 'SUCCESS') {
      dbUpdate = { payment_status: 'paid', status: 'placed' };
    } else if (webhookType === 'PAYMENT_FAILED_WEBHOOK' || paymentStatus === 'FAILED' || paymentStatus === 'USER_DROPPED') {
      dbUpdate = { payment_status: 'failed', status: 'cancelled' };
    } else if (webhookType === 'PAYMENT_CHARGES_WEBHOOK') {
      // Settlement/charges webhook — don't downgrade an already-paid status
      console.log(`Charges webhook for ${orderId}, skipping status update`);
      return new Response(JSON.stringify({ success: true, skipped: 'charges_webhook' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.log(`Unknown webhook type: ${webhookType}, payment_status: ${paymentStatus}`);
      return new Response(JSON.stringify({ success: true, skipped: 'unknown_type' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update order — but never downgrade from 'paid'
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('payment_status')
      .eq('order_number', orderId)
      .maybeSingle();

    if (existingOrder?.payment_status === 'paid') {
      console.log(`Order ${orderId} already paid, skipping webhook update`);
      return new Response(JSON.stringify({ success: true, skipped: 'already_paid' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error } = await supabase
      .from('orders')
      .update(dbUpdate)
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
