-- Phase 5: canonical WhatsApp consent and durable delivery records.
-- Existing clients.whatsapp_opt_in boolean is NOT verified proof and never authorizes sends.
CREATE TABLE whatsapp_accounts (
 organization_id uuid PRIMARY KEY REFERENCES organizations(id),
 waba_id text NOT NULL CHECK(waba_id ~ '^[0-9]{5,30}$'),
 phone_number_id text NOT NULL UNIQUE CHECK(phone_number_id ~ '^[0-9]{5,30}$'),
 access_token_ciphertext text NOT NULL,
 enabled boolean NOT NULL DEFAULT false,
 last_template_sync_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE whatsapp_templates (
 id uuid PRIMARY KEY,
 organization_id uuid NOT NULL REFERENCES organizations(id),
 name text NOT NULL CHECK(name ~ '^[a-z0-9_]{3,120}$'),
 language text NOT NULL CHECK(language ~ '^[a-z]{2}(_[A-Z]{2})?$'),
 category text NOT NULL CHECK(category IN('UTILITY')),
 parameter_count smallint NOT NULL CHECK(parameter_count=3),
 approved boolean NOT NULL DEFAULT false,
 verified_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(organization_id,name,language),
 UNIQUE(organization_id,id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_org_id_fk ON clients(organization_id,id);
CREATE TABLE whatsapp_consents (
 organization_id uuid NOT NULL REFERENCES organizations(id),
 client_id uuid NOT NULL,
 version integer NOT NULL DEFAULT 0 CHECK(version>=0),
 granted boolean NOT NULL DEFAULT false,
 source text,
 evidence_reference text,
 phone_snapshot text,
 recorded_by uuid REFERENCES users(id),
 granted_at timestamptz,
 revoked_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(organization_id,client_id),
 FOREIGN KEY(organization_id,client_id) REFERENCES clients(organization_id,id),
 CHECK (NOT granted OR (granted_at IS NOT NULL AND evidence_reference IS NOT NULL AND phone_snapshot IS NOT NULL))
);
CREATE TABLE whatsapp_consent_events (
 id uuid PRIMARY KEY,
 organization_id uuid NOT NULL REFERENCES organizations(id),
 client_id uuid NOT NULL,
 version integer NOT NULL CHECK(version>0),
 granted boolean NOT NULL,
 source text NOT NULL,
 evidence_reference text,
 phone_snapshot text NOT NULL,
 recorded_by uuid REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(organization_id,client_id) REFERENCES clients(organization_id,id),
 UNIQUE(organization_id,client_id,version)
);
CREATE INDEX idx_wa_consent_events_org ON whatsapp_consent_events(organization_id,client_id,created_at DESC);
CREATE TABLE whatsapp_outbox (
 id uuid PRIMARY KEY,
 organization_id uuid NOT NULL REFERENCES organizations(id),
 client_id uuid NOT NULL,
 charge_id uuid NOT NULL,
 template_id uuid NOT NULL,
 kind text NOT NULL DEFAULT 'due_reminder' CHECK(kind IN('due_reminder')),
 consent_version integer NOT NULL CHECK(consent_version>0),
 target_phone text NOT NULL CHECK(length(target_phone) BETWEEN 10 AND 16),
 state text NOT NULL DEFAULT 'queued' CHECK(state IN
  ('queued','sending','accepted','sent','delivered','read','failed','blocked','unknown','cancelled')),
 attempts integer NOT NULL DEFAULT 0 CHECK(attempts>=0),
 due_at timestamptz NOT NULL DEFAULT now(),
 lease_token uuid,
 lease_until timestamptz,
 provider_message_id text UNIQUE,
 last_error text,
 created_by uuid REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(organization_id,client_id) REFERENCES clients(organization_id,id),
 FOREIGN KEY(organization_id,charge_id) REFERENCES charges(organization_id,id),
 FOREIGN KEY(organization_id,template_id) REFERENCES whatsapp_templates(organization_id,id),
 UNIQUE(organization_id,charge_id,kind),
 CONSTRAINT wa_lease_pair CHECK((lease_token IS NULL)=(lease_until IS NULL))
);
CREATE INDEX idx_wa_outbox_due ON whatsapp_outbox(due_at,created_at) WHERE state='queued';
CREATE INDEX idx_wa_outbox_org ON whatsapp_outbox(organization_id,created_at DESC);
CREATE TABLE whatsapp_delivery_events (
 id uuid PRIMARY KEY,
 organization_id uuid NOT NULL REFERENCES organizations(id),
 outbox_id uuid NOT NULL REFERENCES whatsapp_outbox(id),
 provider_message_id text NOT NULL,
 status text NOT NULL CHECK(status IN ('sent','delivered','read','failed')),
 provider_timestamp bigint NOT NULL,
 error_code text,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(provider_message_id,status,provider_timestamp)
);
CREATE INDEX idx_wa_delivery_events_outbox ON whatsapp_delivery_events(outbox_id,created_at DESC);
CREATE TABLE whatsapp_inbound_dedup (
 provider_message_id text PRIMARY KEY,
 organization_id uuid NOT NULL REFERENCES organizations(id),
 action text NOT NULL CHECK(action IN ('opt_out','ignored')),
 received_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE whatsapp_send_runs (
 id uuid PRIMARY KEY,
 started_at timestamptz NOT NULL DEFAULT now(),
 completed_at timestamptz,
 examined integer NOT NULL DEFAULT 0,
 accepted integer NOT NULL DEFAULT 0,
 blocked integer NOT NULL DEFAULT 0,
 unknown_count integer NOT NULL DEFAULT 0,
 failed integer NOT NULL DEFAULT 0
);
