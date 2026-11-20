-- Phase 2: real operating records. No real payment processing is introduced here.
ALTER TABLE clients ADD COLUMN IF NOT EXISTS internal_code text;
UPDATE clients SET internal_code='CF-' || upper(left(replace(id::text,'-',''),12)) WHERE internal_code IS NULL;
ALTER TABLE clients ALTER COLUMN internal_code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_org_internal_code ON clients(organization_id, internal_code);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS service_name text NOT NULL DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS monthly_fee_cents bigint NOT NULL DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_due_day smallint NOT NULL DEFAULT 10;
ALTER TABLE clients ADD CONSTRAINT clients_monthly_fee_nonnegative CHECK(monthly_fee_cents>=0);
ALTER TABLE clients ADD CONSTRAINT clients_preferred_due_day_range CHECK(preferred_due_day BETWEEN 1 AND 31);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_org_active_phone ON clients(organization_id,phone) WHERE status='active';
ALTER TABLE services ADD COLUMN IF NOT EXISTS default_frequency text NOT NULL DEFAULT 'mensal';
ALTER TABLE services ADD CONSTRAINT services_frequency_allowed CHECK(default_frequency IN('unica','semanal','mensal','personalizada'));
CREATE TABLE IF NOT EXISTS client_import_batches (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  actor_id uuid NOT NULL REFERENCES users(id),
  imported_count integer NOT NULL CHECK(imported_count>=0),
  rejected_count integer NOT NULL CHECK(rejected_count>=0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_imports_org_created ON client_import_batches(organization_id,created_at DESC);
CREATE TABLE IF NOT EXISTS charge_history (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  charge_id uuid NOT NULL REFERENCES charges(id),
  actor_id uuid REFERENCES users(id),
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_charge_history_org_charge ON charge_history(organization_id,charge_id,created_at DESC);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT '';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_phone text NOT NULL DEFAULT '';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS contact_email text NOT NULL DEFAULT '';
