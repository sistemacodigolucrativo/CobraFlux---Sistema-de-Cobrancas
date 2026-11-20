-- Stable public identifiers for session-management UI; token hashes remain private.
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_sessions_id ON auth_sessions(id);
