-- Phase 7 / BL-006: manually managed INTERNAL support deadlines (no SLA policy inferred).
-- Deliberately does not dispatch messages, recognize delivery, or impose default deadlines.
CREATE TABLE support_ticket_sla (
 ticket_id uuid PRIMARY KEY REFERENCES support_tickets(id),
 due_at timestamptz,
 updated_by uuid NOT NULL REFERENCES users(id),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_support_ticket_sla_due ON support_ticket_sla(due_at) WHERE due_at IS NOT NULL;

CREATE TABLE support_ticket_sla_events (
 id uuid PRIMARY KEY,
 ticket_id uuid NOT NULL REFERENCES support_tickets(id),
 organization_id uuid REFERENCES organizations(id),
 actor_id uuid NOT NULL REFERENCES users(id),
 previous_due_at timestamptz,
 new_due_at timestamptz,
 reason text NOT NULL CHECK(length(trim(reason)) BETWEEN 10 AND 1000),
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT sla_changed CHECK(previous_due_at IS DISTINCT FROM new_due_at)
);
CREATE INDEX idx_support_ticket_sla_events_ticket ON support_ticket_sla_events(ticket_id,created_at DESC,id DESC);

-- Separate append-only administrative evidence from the mutable current deadline.
CREATE OR REPLACE FUNCTION cobraflux_sla_events_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'support ticket SLA events are append-only';
END;
$$;
CREATE TRIGGER trg_support_ticket_sla_events_append_only
 BEFORE UPDATE OR DELETE ON support_ticket_sla_events
 FOR EACH ROW EXECUTE FUNCTION cobraflux_sla_events_append_only();
