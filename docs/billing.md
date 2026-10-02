# Billing

Billing is organization-scoped. The organization is the entitlement boundary because documents and knowledge bases belong to an organization.

## Architecture

- `db/migrations/20260930100000-create-billing-tables.js` creates plans, subscriptions, payments, idempotency keys, webhook inbox records, usage counters, and billing audit events.
- `lib/billing/razorpay.ts` is the only Razorpay API/signature integration layer.
- `lib/billing/service.ts` owns plan lookup, entitlement calculation, checkout creation, payment verification, webhook reconciliation, cancellation, and usage enforcement.
- `app/api/billing/*` contains the HTTP boundary.
- `app/(app)/billing/page.tsx` is the reusable billing UI.

## Payment model

The application uses Razorpay Subscriptions because the product has recurring SaaS plans. Razorpay's subscription checkout returns a payment ID, subscription ID, and signature; the server verifies the subscription signature using `payment_id|subscription_id`. Permanent access is not granted from the browser callback; the webhook is responsible for lifecycle reconciliation. Razorpay also recommends server-side verification and signed webhook validation. 

## Environment

Set these only on the server:

```text
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

`RAZORPAY_KEY_ID` is safe to pass to Razorpay Checkout. Never expose the secret or webhook secret.

## Plans

The migration seeds Free, Pro, and Enterprise records. Replace the `CONFIGURE_*` Razorpay plan IDs with real Razorpay plan IDs before enabling paid checkout.

Prices are stored in the smallest currency unit (INR paise). Plan price, currency, features, and limits are always read server-side.

`null` means unlimited. `0` means unavailable. A positive integer is a hard finite limit.

## Webhook

Configure:

```text
POST /api/billing/webhooks/razorpay
```

The endpoint reads the raw request body and validates `x-razorpay-signature` before processing. Webhook records are persisted with a unique event ID, so duplicate deliveries are safe.

Relevant subscription/payment/refund events should be enabled in the Razorpay Dashboard for the production account. The handler maps subscription lifecycle events and payment/refund events into internal records.

## Entitlement rules

The UI remains discoverable. Authorization is server-side.

A protected operation should follow:

```text
authentication
  -> organization
  -> current subscription state
  -> feature entitlement
  -> atomic usage check/consume
  -> expensive operation
```

Expired/cancelled subscriptions fall back to Free entitlements. Cancel-at-period-end keeps the current subscription entitled until the period actually ends.

## Idempotency

Checkout requests require a client-generated idempotency key. A unique database constraint prevents two requests with the same organization/operation/key from creating two internal checkout operations. A `CREATING` reservation also prevents concurrent requests from intentionally opening duplicate Razorpay subscriptions with the same key.

Webhook events have a unique event ID and persisted processing state (`RECEIVED`, `PROCESSED`, `FAILED`). Failed processing is retryable.

## Usage limits

Usage counters are keyed by organization, resource, and period. Monthly AI usage uses `YYYY-MM`; lifetime resources use `lifetime`.

The counter row is locked inside the transaction before the quota is checked and incremented. This prevents two concurrent requests from both consuming the final available quota.

## Cancellation

The current UI uses cancel-at-period-end. Immediate cancellation is supported by the service/Razorpay API boundary but should only be exposed when the product policy explicitly requires it.

Cancellation request and actual subscription termination are separate states. Access is derived from the reconciled subscription state, not from the cancellation button response.

## Refunds

Refund webhook data updates the internal payment status and refunded amount. Subscription entitlement is not automatically revoked solely because a refund occurs; that business policy should be made explicit before enabling automatic revocation.

## Production setup

1. Create Razorpay plans for each paid billing interval.
2. Replace the seeded placeholder plan IDs in `billing_plans`.
3. Configure server environment variables.
4. Configure the Razorpay webhook URL above.
5. Use separate Razorpay test/live credentials per environment.
6. Enable the required payment/subscription/refund webhook events.
7. Run migrations.
8. Test duplicate checkout, failed payment, browser-close-after-payment, duplicate/out-of-order webhook delivery, cancellation, expiry, refunds, and concurrent quota consumption in test mode.

## Important current limitation

Upgrade/downgrade/proration is intentionally not guessed. Razorpay subscription plan-change behavior must be confirmed for the merchant's enabled subscription configuration before exposing automatic plan switching. The safe current flow is to create a new subscription for a new paid plan and reconcile access only after the new subscription becomes active.
