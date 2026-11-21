-- Phase 3: an issued Pix is never cancelled locally before independent Asaas sandbox verification.
-- Keep the original payment and its audit trail. Only one cancellation intent may exist per issued charge.
ALTER TABLE charges DROP CONSTRAINT IF EXISTS charges_status_check;
ALTER TABLE charges ADD CONSTRAINT charges_status_check CHECK(status IN
  ('draft','pending_provider','pending','cancel_pending','paid','partial',
   'partially_refunded','overdue','cancelled','refunded'));
CREATE TABLE sandbox_cancellation_requests (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  account_id uuid NOT NULL REFERENCES sandbox_payment_accounts(id),
  charge_id uuid NOT NULL UNIQUE REFERENCES charges(id),
  provider_payment_id text NOT NULL,
  actor_id uuid NOT NULL REFERENCES users(id),
  reason text NOT NULL CHECK(length(reason) BETWEEN 5 AND 200),
  previous_status text NOT NULL CHECK(previous_status IN('pending','overdue')),
  state text NOT NULL CHECK(state IN('reserved','submitted','reconcile_required','completed','rejected')),
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sandbox_cancellations_org ON sandbox_cancellation_requests
  (organization_id,created_at DESC);
CREATE INDEX idx_sandbox_cancellations_pending ON sandbox_cancellation_requests
  (organization_id,updated_at) WHERE state IN('reserved','submitted','reconcile_required');
