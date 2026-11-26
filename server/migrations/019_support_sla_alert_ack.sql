-- F7 / BL-006: ack of an overdue INTERNAL alert, bound to the exact SLA revision.
-- This does NOT dispatch notifications nor establish a commercial SLA policy.
ALTER TABLE support_ticket_sla
 ADD COLUMN revision bigint NOT NULL DEFAULT 1 CHECK(revision > 0);

CREATE TABLE support_ticket_sla_alert_ack (
 id uuid PRIMARY KEY,
 ticket_id uuid NOT NULL REFERENCES support_tickets(id),
 sla_revision bigint NOT NULL CHECK(sla_revision > 0),
 organization_id uuid REFERENCES organizations(id),
 actor_id uuid NOT NULL REFERENCES users(id),
 reason text NOT NULL CHECK(length(trim(reason)) BETWEEN 10 AND 1000),
 acknowledged_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(ticket_id,sla_revision)
);
CREATE INDEX idx_support_ticket_sla_alert_ack_ticket ON support_ticket_sla_alert_ack(ticket_id,sla_revision);

-- Acknowledgements are immutable. A new SLA revision creates a new, unacknowledged alert.
CREATE OR REPLACE FUNCTION cobraflux_sla_alert_ack_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'support SLA alert acknowledgements are append-only';
END;
$$;
CREATE TRIGGER trg_support_ticket_sla_alert_ack_append_only
 BEFORE UPDATE OR DELETE ON support_ticket_sla_alert_ack
 FOR EACH ROW EXECUTE FUNCTION cobraflux_sla_alert_ack_append_only();
