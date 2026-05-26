# Subscription & Razorpay Integration

Generated: 2026-05-26T14:11:56+05:30
Working directory: E:\Projects\sneh-matrimony
Workspace root: E:\Projects\sneh-matrimony
Open tabs: components/dashboard/ActionCenter.tsx

## Overview

End-to-end flow implemented in the repo:
- Client requests a payment order from the server (/api/payments/create-order).
- Server creates a Razorpay Order via the razorpay npm client and persists a Payment record.
- Client opens Razorpay checkout with the returned orderId and keyId.
- On successful payment, Razorpay returns razorpay_order_id, razorpay_payment_id, and razorpay_signature to the client.
- Client POSTs those three fields to /api/payments/verify.
- Server verifies the HMAC signature and then fulfills the payment: marks Payment as PAID and creates an ACTIVE Subscription with startsAt/expiresAt.
- Webhooks are validated server-side using a separate webhook secret.

## Key files (quick references)
- Razorpay client + signature logic: lib/razorpay.ts:14-21,30-41,44-55
- Create order endpoint: app/api/payments/create-order/route.ts:39-59,70-76
- Client checkout component: components/subscription/CheckoutButton.tsx:97-116,141-147
- Verify endpoint: app/api/payments/verify/route.ts:34-36,50-66
- Payment fulfillment (mark PAID + create subscription): lib/payment-fulfillment.ts:25-55,57-58
- Subscription plans & pricing: lib/subscriptions.ts:8-16,38-41,67-69
- Database fields (Payment): prisma/schema.prisma:301-303
- Webhook route: app/api/payments/webhook/route.ts:3,25

## Important environment variables
- RAZORPAY_KEY_ID — server-side key id (also exposed to client via NEXT_PUBLIC_RAZORPAY_KEY_ID)
- RAZORPAY_KEY_SECRET — server-side secret used to sign/verify payments
- NEXT_PUBLIC_RAZORPAY_KEY_ID — optional: public key id sent to client
- RAZORPAY_WEBHOOK_SECRET — secret used to validate webhook HMACs

.lib/razorpay.ts uses process.env values: see lib/razorpay.ts:16-19,24-27,49-50

## Database model notes
- Payment stores razorpayOrderId (unique), razorpayPaymentId (unique), razorpaySignature: prisma/schema.prisma:301-303
- fulfillPayment links Payment -> Subscription by paymentId and creates an ACTIVE subscription when a payment is completed: lib/payment-fulfillment.ts:43-52
- Subscription expiry is computed using getSubscriptionExpiry in lib/subscriptions.ts:67-69

## How to run & test locally
1. Populate environment variables (use Razorpay test keys) in .env. See .env.example for hints.
2. Start the app in your usual development mode (Next.js dev server). Ensure you are authenticated as a user when initiating checkout.
3. Use the UI (Subscribe page) which triggers components/subscription/CheckoutButton.tsx to call /api/payments/create-order.
4. Complete the Razorpay test checkout flow (use test cards/methods from Razorpay docs).
5. Confirm server records Payment and Subscription (via database or /dashboard). Verify /api/payments/verify returns success.
6. Optionally configure a public tunnel (ngrok) and configure Razorpay webhooks using your RAZORPAY_WEBHOOK_SECRET to test webhook delivery handling.

## Where to change pricing or plans
- Modify PLANS in lib/subscriptions.ts:8-31. listPricePaise is the canonical list price; getPayableAmountPaise applies INTRO_DISCOUNT_PERCENT.

## Security & operational notes
- Always keep RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET out of source control.
- verifyPaymentSignature implements payment HMAC verification (lib/razorpay.ts:30-41). The server rejects verification failures.
- verifyWebhookSignature validates webhook payloads using RAZORPAY_WEBHOOK_SECRET (lib/razorpay.ts:44-55).
- When processing webhooks, ensure idempotency (current code verifies and updates Payment / Subscription via transactions; review webhook handler for duplicate deliveries).

## Failure handling
- create-order returns 500 on Razorpay errors; client surfaces a user-facing error in CheckoutButton.tsx.
- Payment failures are handled in the checkout handler (payment.failed event) and verification errors propagate back to the client.
- fulfillPayment uses a transaction to avoid race conditions when creating Payment → Subscription.

## Quick troubleshooting
- Missing environment vars will throw at startup: see requireEnv in lib/razorpay.ts:4-10 and getRazorpayClient:14-21.
- If payments are not being marked PAID, check /api/payments/verify is receiving the three fields (order_id, payment_id, signature) and verifyPaymentSignature returns true.
- If subscriptions expire incorrectly, verify SUBSCRIPTION_DURATION_MS in lib/subscriptions.ts:4 and getSubscriptionExpiry logic:67-69.

## References
See the files listed above for exact implementation. Use the provided file_path:line_number references to jump directly to code.

