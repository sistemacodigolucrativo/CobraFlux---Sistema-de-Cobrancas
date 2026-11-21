-- CobraFlux Phase 3: durable leases and bounded retries for sandbox-only financial reconciliation.
-- Each migration executes once under the migrator's advisory lock.
ALTER TABLE sandbox_issuances
  ADD COLUMN reconcile_due_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN reconcile_lease_until timestamptz,
  ADD COLUMN reconcile_attempts integer NOT NULL DEFAULT 0 CHECK (reconcile_attempts>=0),
  ADD COLUMN last_reconciled_at timestamptz,
  ADD COLUMN last_reconcile_error text,
  ADD COLUMN review_required boolean NOT NULL DEFAULT false,
  ADD COLUMN review_reason text;
CREATE INDEX idx_sandbox_reconcile_due
  ON sandbox_issuances(reconcile_due_at, reconcile_lease_until)
  WHERE state='ready';
ALTER TABLE sandbox_refund_requests
  ADD COLUMN receipt_url text;
CREATE TABLE sandbox_reconciliation_incidents (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  charge_id uuid NOT NULL REFERENCES charges(id),
  code text NOT NULL CHECK (length(code) BETWEEN 3 AND 100),
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  UNIQUE (organization_id, charge_id, code)
);
CREATE INDEX idx_sandbox_incidents_open
  ON sandbox_reconciliation_incidents(organization_id, last_seen_at DESC)
  WHERE resolved_at IS NULL;
