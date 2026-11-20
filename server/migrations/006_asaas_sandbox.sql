-- Fase 3: integracao financeira EXCLUSIVAMENTE no sandbox, com credenciais por tenant.
CREATE TABLE sandbox_payment_accounts (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL UNIQUE REFERENCES organizations(id),
  provider text NOT NULL DEFAULT 'asaas_sandbox' CHECK(provider='asaas_sandbox'),
  api_key_ciphertext text NOT NULL,
  webhook_token_hash text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sandbox_customers (
  organization_id uuid NOT NULL REFERENCES organizations(id),
  account_id uuid NOT NULL REFERENCES sandbox_payment_accounts(id),
  client_id uuid NOT NULL REFERENCES clients(id),
  provider_customer_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(account_id, client_id),
  UNIQUE(account_id, provider_customer_id)
);
CREATE TABLE sandbox_issuances (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  account_id uuid NOT NULL REFERENCES sandbox_payment_accounts(id),
  charge_id uuid NOT NULL UNIQUE REFERENCES charges(id),
  state text NOT NULL CHECK(state IN('reserved','ready','reconcile_required')),
  provider_customer_id text,
  provider_payment_id text,
  expected_cents bigint NOT NULL CHECK(expected_cents>0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, provider_payment_id)
);
CREATE INDEX idx_sandbox_issuances_org ON sandbox_issuances(organization_id,created_at DESC);
ALTER TABLE payment_events ADD COLUMN organization_id uuid REFERENCES organizations(id);
ALTER TABLE payment_events ADD COLUMN processing_result text NOT NULL DEFAULT 'not_processed';
-- The existing provider_event_id uniqueness protects against duplicate at-least-once deliveries.
CREATE UNIQUE INDEX idx_charges_provider_payment ON charges(provider,provider_charge_id)
  WHERE provider_charge_id IS NOT NULL;
