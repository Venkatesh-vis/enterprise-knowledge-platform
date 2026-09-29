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

The six `RAZORPAY_PLAN_*` values are Razorpay Plan IDs created in the Razorpay dashboard/API. Their amounts must match the server-side prices in `lib/billing/plans.ts`.

## Webhook

Configure Razorpay to POST to:

`/api/billing/webhook`

Use a public HTTPS URL. Configure at least:

- `subscription.activated`
- `subscription.charged`
- `subscription.resumed`
- `subscription.paused`
- `subscription.cancelled`
- `subscription.halted`
- `payment.authorized`
- `payment.failed`

The webhook signature is verified against the raw request body before processing. Event IDs are persisted so duplicate deliveries are idempotent.

## Database

Run the normal Sequelize migrations after deploying this branch. Existing organizations are given a 14-day Starter trial by the billing migration.

## Billing behavior

- Plan and billing-cycle prices are authoritative on the server.
- Client-submitted prices are never trusted.
- Subscription signatures are verified server-side.
- Webhooks reconcile subscription state asynchronously.
- Downgrades are rejected when current user/storage usage exceeds the target plan.
- User invitations are blocked at the server when the organization reaches its user limit.
- Advanced RBAC role changes are gated by plan entitlement.
- Invoice records are stored per organization and can be downloaded from the protected billing page.
- Razorpay's subscription flow is configured for a finite subscription count: 120 monthly cycles or 10 yearly cycles. This stays within Razorpay's documented subscription lifetime constraints and should be reviewed if the product later requires a different renewal model.
