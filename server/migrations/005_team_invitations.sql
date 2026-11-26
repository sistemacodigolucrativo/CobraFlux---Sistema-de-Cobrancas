-- CobraFlux phase 2: tokenized team invitations; only the owner or MFA admin issues invites.
-- Existing members keep their existing account and can join another organization explicitly.
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by uuid NOT NULL REFERENCES users(id),
  email text NOT NULL CHECK (email=lower(email)),
  role text NOT NULL DEFAULT 'operator' CHECK (role='operator'),
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (accepted_at IS NULL OR revoked_at IS NULL)
);
CREATE INDEX IF NOT EXISTS idx_team_invitations_org ON team_invitations(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_invitations_pending
  ON team_invitations(organization_id,email)
  WHERE accepted_at IS NULL AND revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_memberships_org ON memberships(organization_id,user_id);
