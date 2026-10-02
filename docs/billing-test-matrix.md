# Billing test matrix

Run these in Razorpay Test Mode before production. No new test dependency was added because the project does not currently expose a test runner.

| Scenario | Expected result |
|---|---|
| Free user opens `/billing` | Plans and Free entitlement are visible. |
| Free user calls protected paid feature | `FEATURE_NOT_AVAILABLE` or `PLAN_LIMIT_REACHED` from backend. |
| Valid paid checkout | One internal subscription record and one Razorpay subscription. |
| Same checkout idempotency key repeated | Existing operation is returned or `CHECKOUT_IN_PROGRESS`; no second internal checkout for that key. |
| Two browser tabs use the same idempotency key | Database uniqueness prevents duplicate reservation. |
| Two tabs use different keys while an active subscription exists | Backend rejects the second checkout. |
| Tampered plan ID | Server rejects the plan if it is not an active DB plan. |
| Tampered amount | Amount is never accepted from the client. |
| Invalid checkout signature | `PAYMENT_VERIFICATION_FAILED`. |
| Valid subscription callback but webhook delayed | Signature can be verified, but entitlement remains webhook-driven. |
| Browser closes after successful payment | Webhook can still activate/reconcile the subscription. |
| Invalid webhook signature | Request rejected; no billing state mutation. |
| Same webhook delivered twice | Unique event ID makes processing idempotent. |
| Webhook processing DB failure | Event is not marked processed; retry remains safe. |
| Subscription becomes active | Internal subscription becomes `ACTIVE`; paid entitlement is available. |
| Subscription becomes pending/halted | Paid entitlement is not treated as active. |
| Subscription is cancelled immediately | Entitlement falls back to Free after the lifecycle event. |
| Cancel at period end | Current access remains until the actual period end. |
| Subscription expires | Protected operations fall back to Free entitlement. |
| Captured payment webhook | Payment is stored as `CAPTURED`. |
| Failed payment webhook | Payment is stored as `FAILED`; subscription state is reconciled separately. |
| Full refund processed | Payment becomes `REFUNDED`. |
| Partial refund processed | Payment becomes `PARTIALLY_REFUNDED`. |
| Final document slot consumed concurrently | Row lock allows only requests within the hard quota. |
| Final knowledge-base slot consumed concurrently | Same row-lock behavior for the knowledge-base counter. |
| User A requests User B billing record | Organization-scoped query prevents cross-organization access. |
| Razorpay API timeout | Checkout creation fails without granting entitlement. |
| Missing Razorpay secret in production | Server returns configuration failure rather than silently starting billing. |

## Manual security checks

1. Change `planId` in the browser request to another organization's/nonexistent plan.
2. Add a fake amount to the checkout request.
3. Replace the subscription ID in verification with another subscription belonging to the same or another organization.
4. Replay a previously valid webhook payload.
5. Modify one byte of the webhook body without changing its signature.
6. Call paid APIs directly without using the UI.
7. Attempt two final-quota requests concurrently.
8. Remove Razorpay secrets from the environment and confirm the application fails the billing operation safely.
