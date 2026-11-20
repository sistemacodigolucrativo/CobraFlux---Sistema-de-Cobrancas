-- Identity hardening: email verification, admin MFA, fixed-organization sessions.
CREATE TABLE IF NOT EXISTS email_verifications (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user ON email_verifications(user_id,created_at DESC);

-- A user session is bound to exactly one organization selected at login.
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id);
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS mfa_verified boolean NOT NULL DEFAULT false;
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_sessions_id ON auth_sessions(id);
-- Invalidate legacy sessions rather than guess which organization they belong to.
UPDATE auth_sessions SET revoked_at=now() WHERE organization_id IS NULL AND revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS admin_mfa (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  secret_encrypted text NOT NULL,
  enabled_at timestamptz NOT NULL DEFAULT now(),
  last_used_step bigint NOT NULL DEFAULT -1
);
