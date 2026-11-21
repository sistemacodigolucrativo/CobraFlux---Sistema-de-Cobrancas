-- Fase 3: devolução Pix sandbox. Valor original é imutável; estorno só é contabilizado após DONE no provedor.
ALTER TABLE charges ADD COLUMN IF NOT EXISTS refunded_cents bigint NOT NULL DEFAULT 0;
ALTER TABLE charges ADD CONSTRAINT charges_refunded_valid CHECK (refunded_cents>=0 AND refunded_cents<=amount_cents-discount_cents);
ALTER TABLE charges DROP CONSTRAINT IF EXISTS charges_status_check;
ALTER TABLE charges ADD CONSTRAINT charges_status_check CHECK(status IN
  ('draft','pending_provider','pending','paid','partial','partially_refunded','overdue','cancelled','refunded'));
ALTER TABLE sandbox_issuances ADD COLUMN IF NOT EXISTS refund_sync_required boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS sandbox_refund_requests (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  account_id uuid NOT NULL REFERENCES sandbox_payment_accounts(id),
  charge_id uuid NOT NULL REFERENCES charges(id),
  provider_payment_id text NOT NULL,
  requested_cents bigint NOT NULL CHECK(requested_cents>0),
  description text NOT NULL,
  state text NOT NULL CHECK(state IN('reserved','submitted','reconcile_required','completed','denied')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sandbox_refunds_single_active
  ON sandbox_refund_requests(charge_id) WHERE state IN('reserved','submitted','reconcile_required');
CREATE INDEX IF NOT EXISTS idx_sandbox_refunds_org_charge
  ON sandbox_refund_requests(organization_id,charge_id,created_at DESC);
