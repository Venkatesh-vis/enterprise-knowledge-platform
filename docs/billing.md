# Razorpay Billing Setup

This project uses Razorpay Subscriptions with server-side signature verification and webhook reconciliation.

## Environment variables

Set these in the deployment environment. Do not commit them.

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `RAZORPAY_PLAN_STARTER_MONTHLY`
- `RAZORPAY_PLAN_STARTER_YEARLY`
- `RAZORPAY_PLAN_BUSINESS_MONTHLY`
- `RAZORPAY_PLAN_BUSINESS_YEARLY`
- `RAZORPAY_PLAN_ENTERPRISE_MONTHLY`
- `RAZORPAY_PLAN_ENTERPRISE_YEARLY`

The six `RAZORPAY_PLAN_*` values are Razorpay Plan IDs. Their configured amounts must match the server-side prices in `lib/billing/plans.ts`.

## Webhook

Configure Razorpay to POST to `/api/billing/webhook` on a public HTTPS endpoint. Configure subscription activation/charge/resume/pause/cancel/halt and payment authorization/failure events. The webhook signature is verified against the raw request body and event IDs are persisted for idempotency.

## Database

Run the normal Sequelize migrations after deploying this branch. Existing organizations receive a 14-day Starter trial.

## Billing behavior

- Prices and entitlements are authoritative on the server.
- Checkout never accepts a client-supplied amount.
- Subscription signatures are verified server-side.
- Webhooks reconcile state asynchronously.
- Downgrades are rejected when current user/storage usage exceeds the target plan.
- User invitations are blocked when the user limit is reached.
- Advanced RBAC role changes are gated by plan.
- Invoice records are stored per organization and protected by billing authorization.
- Invoice downloads are generated from stored invoice details; the Razorpay hosted invoice is also available when supplied.
- Monthly subscriptions are configured for 120 cycles and yearly subscriptions for 10 cycles.
