-- Manual LGPD review records: no automatic fulfillment or deletion.
CREATE TABLE privacy_manual_reviews(
 id uuid PRIMARY KEY,
 request_id uuid NOT NULL REFERENCES privacy_requests(id),
 actor_id uuid NOT NULL REFERENCES users(id),
 identity_status text NOT NULL CHECK(identity_status IN ('pending','verified','rejected')),
 risk text NOT NULL CHECK(risk IN ('standard','elevated')),
 verification_method text NOT NULL CHECK(verification_method IN ('none','authenticated_ownership','additional_secure_check')),
 due_at timestamptz,
 action_note text NOT NULL CHECK(length(trim(action_note)) BETWEEN 15 AND 1000),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(identity_status <> 'verified' OR (verification_method <> 'none' AND (risk <> 'elevated' OR verification_method='additional_secure_check')))
);
CREATE INDEX idx_privacy_manual_reviews_request ON privacy_manual_reviews(request_id,created_at DESC,id DESC);
CREATE TRIGGER trg_privacy_manual_reviews_append_only BEFORE UPDATE OR DELETE ON privacy_manual_reviews
 FOR EACH ROW EXECUTE FUNCTION cobraflux_privacy_events_append_only();
