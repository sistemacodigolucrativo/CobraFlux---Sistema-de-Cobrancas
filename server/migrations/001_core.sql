-- CobraFlux production foundation. Deliberately does NOT record simulated payment as paid.
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY,
  name text NOT NULL CHECK (length(trim(name)) > 1),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','blocked')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE CHECK (email=lower(email)),
  password_hash text NOT NULL,
  email_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS memberships (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','operator','super_admin')),
  PRIMARY KEY(user_id, organization_id)
);
CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);
CREATE TABLE IF NOT EXISTS password_resets (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY,
  hits integer NOT NULL DEFAULT 1,
  window_started_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active' CHECK(status IN ('active','archived')),
  whatsapp_opt_in boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clients_org_status ON clients(organization_id,status);
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_cents bigint NOT NULL CHECK(price_cents>=0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_services_org ON services(organization_id);
CREATE TABLE IF NOT EXISTS charges (
  id uuid PRIMARY KEY,
  public_token text NOT NULL UNIQUE,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  client_id uuid NOT NULL REFERENCES clients(id),
  service_id uuid REFERENCES services(id),
  description text NOT NULL,
  amount_cents bigint NOT NULL CHECK(amount_cents>0),
  discount_cents bigint NOT NULL DEFAULT 0 CHECK(discount_cents>=0),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK(status IN('draft','pending_provider','pending','paid','partial','overdue','cancelled','refunded')),
  provider text,
  provider_charge_id text,
  pix_payload text,
  paid_cents bigint NOT NULL DEFAULT 0 CHECK(paid_cents>=0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(discount_cents<amount_cents),
  UNIQUE (organization_id, id)
);
CREATE INDEX IF NOT EXISTS idx_charges_org_status_due ON charges(organization_id,status,due_date);
CREATE TABLE IF NOT EXISTS payment_events (
  id uuid PRIMARY KEY,
  charge_id uuid NOT NULL REFERENCES charges(id),
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text NOT NULL,
  event_payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider,provider_event_id)
);
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  actor_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_created ON audit_logs(organization_id,created_at DESC);
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK(status IN('open','in_progress','closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
