
# Fix End-to-End Online Payment Flow

## Problem Summary

Successful online payments (UPI/Card) still show as "PAYMENT FAILED" in the customer dashboard, and merchants never see these orders. There are **three root causes**:

1. **Webhook URL is empty**: The `cashfree-create-order` edge function sends `notify_url: ''` to Cashfree, so Cashfree never calls the webhook to update payment status in the database.
2. **Client-side update is unreliable**: The checkout code tries to update `payment_status` to `"paid"` based on `result.paymentDetails` from the Cashfree modal, but this object can be missing or the modal can close unexpectedly.
3. **No "processing" state**: Orders are immediately classified as either "paid" or "payment_failed" with nothing in between, so any delay or network hiccup = permanent failure display.

## Solution

### 1. Fix Webhook URL in `cashfree-create-order` Edge Function
- Set `notify_url` to the actual `cashfree-webhook` edge function URL so Cashfree sends payment status updates to the backend.

### 2. Add Payment Verification After Modal Closes
- After the Cashfree modal closes (success or ambiguous), call a **new edge function** `cashfree-verify-payment` that queries Cashfree's Order Status API (`GET /pg/orders/{order_id}`) to get the definitive payment status.
- Update the order's `payment_status` based on the verified result: `paid`, `failed`, or `processing` (if still active/pending at Cashfree).

### 3. Add "Payment Processing" State
- Introduce a `payment_processing` display state for orders where payment is neither confirmed nor definitively failed (Cashfree status = `ACTIVE`).
- This handles network/bank delays gracefully.

### 4. Update All Dashboards

**Customer Orders** (`CustomerOrders.tsx`):
- Show "PAYMENT PROCESSING" (amber badge) for orders with `payment_status = 'processing'`.
- Show "PAYMENT FAILED" only when `payment_status = 'failed'`.
- Show normal tracking pipeline for `payment_status = 'paid'` or COD.

**Merchant Dashboard** (`MerchantDashboard.tsx`):
- Keep filtering: only show COD orders or online orders with `payment_status = 'paid'`.
- No change needed here (already correct once webhook/verification works).

**Admin Panel** (`AdminPanel.tsx`):
- Show three payment badges: "COD" (blue), "PAID" (green), "PROCESSING" (amber), "PAY FAILED" (red).

## Technical Details

### New Edge Function: `cashfree-verify-payment`

```text
Client (after modal close)
    |
    v
cashfree-verify-payment (Edge Function)
    |-- GET https://api.cashfree.com/pg/orders/{order_id}
    |-- Read order_status from Cashfree response
    |-- If PAID -> update DB payment_status = 'paid'
    |-- If ACTIVE -> update DB payment_status = 'processing'  
    |-- If EXPIRED/TERMINATED -> update DB payment_status = 'failed', status = 'cancelled'
    |-- Return verified status to client
```

### Modified Files

| File | Change |
|------|--------|
| `supabase/functions/cashfree-create-order/index.ts` | Set `notify_url` to webhook URL |
| `supabase/functions/cashfree-webhook/index.ts` | Also update `status` to `cancelled` when payment fails; set status to `placed` when paid |
| `supabase/functions/cashfree-verify-payment/index.ts` | **New** -- verifies payment status with Cashfree API |
| `src/pages/CheckoutPage.tsx` | After modal closes, call `cashfree-verify-payment` instead of blindly setting paid/failed |
| `src/pages/CustomerOrders.tsx` | Add `payment_processing` display state with amber badge; only mark `payment_failed` when `payment_status = 'failed'` |
| `src/pages/AdminPanel.tsx` | Add "PROCESSING" amber badge for `payment_status = 'processing'` |

### Checkout Flow (Updated)

1. User clicks "Place Order" -- order created with `payment_status: 'awaiting'`
2. Cashfree modal opens
3. User completes/cancels payment
4. Modal closes -- client calls `cashfree-verify-payment` with the order number
5. Edge function queries Cashfree API for definitive status
6. DB updated with verified status (`paid` / `processing` / `failed`)
7. If `paid`: success toast, clear cart, redirect
8. If `processing`: info toast ("Payment is being verified, check back shortly"), redirect
9. If `failed`: error toast, order cancelled

Meanwhile, the webhook also fires from Cashfree (as backup) to update the status, ensuring eventual consistency even if the client-side verification fails.
