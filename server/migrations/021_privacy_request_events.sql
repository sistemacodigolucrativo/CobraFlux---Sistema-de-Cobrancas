-- F7 BL-007: preserve the human privacy review decision trail.
-- This log does NOT certify fulfillment or legal validity, and never erases records.
CREATE TABLE privacy_request_events(
 id uuid PRIMARY KEY,
 request_id uuid NOT NULL REFERENCES privacy_requests(id),
 organization_id uuid NOT NULL REFERENCES organizations(id),
 actor_id uuid NOT NULL REFERENCES users(id),
 action text NOT NULL CHECK(action IN('created','reviewed')),
 previous_state text CHECK(previous_state IS NULL OR
  previous_state IN('open','in_review','awaiting_evidence','closed_rejected')),
 new_state text NOT NULL CHECK(new_state IN('open','in_review','awaiting_evidence','closed_rejected')),
 reviewer_note text NOT NULL CHECK(length(trim(reviewer_note)) BETWEEN 15 AND 1000),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK((action='created' AND previous_state IS NULL AND new_state='open') OR
  (action='reviewed' AND previous_state IS NOT NULL AND previous_state<>new_state))
);
CREATE INDEX idx_privacy_request_events_request_date ON privacy_request_events(request_id,created_at ASC,id ASC);
CREATE OR REPLACE FUNCTION cobraflux_privacy_events_append_only()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'privacy request events are append-only';
END;
$$;
CREATE TRIGGER trg_privacy_request_events_append_only
 BEFORE UPDATE OR DELETE ON privacy_request_events
 FOR EACH ROW EXECUTE FUNCTION cobraflux_privacy_events_append_only();
