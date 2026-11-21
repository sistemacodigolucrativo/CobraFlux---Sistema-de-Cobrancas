-- Phase 7: administrative workflows and audited requests, independent from merchant/PSP money.
-- No automatic erasure of legally required financial records is inferred from an LGPD request.
CREATE TABLE privacy_requests(
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  requested_by uuid NOT NULL REFERENCES users(id),
  kind text NOT NULL CHECK(kind IN('access','rectification','erasure','portability')),
  subject text NOT NULL DEFAULT 'organization' CHECK(subject='organization'),
  state text NOT NULL DEFAULT 'open' CHECK(state IN('open','in_review','awaiting_evidence','closed_rejected')),
  reason text NOT NULL CHECK(length(trim(reason)) BETWEEN 12 AND 1500),
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamptz,
  reviewer_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_privacy_requests_org_date ON privacy_requests(organization_id,created_at DESC);
CREATE INDEX idx_privacy_requests_state_date ON privacy_requests(state,created_at DESC);

CREATE TABLE support_ticket_events(
  id uuid PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES support_tickets(id),
  organization_id uuid REFERENCES organizations(id),
  actor_id uuid NOT NULL REFERENCES users(id),
  old_status text NOT NULL CHECK(old_status IN('open','in_progress','closed')),
  new_status text NOT NULL CHECK(new_status IN('open','in_progress','closed')),
  reason text NOT NULL CHECK(length(trim(reason)) BETWEEN 10 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_support_ticket_events_ticket ON support_ticket_events(ticket_id,created_at DESC);

-- Guard the application's audit trail against accidental modification/deletion.
-- Superusers/DB owners can still manage it administratively; DB retention operations
-- require explicit governance and should not modify an existing row.
CREATE OR REPLACE FUNCTION cobraflux_audit_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'audit_logs are append-only';
END;
$$;
CREATE TRIGGER trg_audit_logs_append_only
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION cobraflux_audit_append_only();
