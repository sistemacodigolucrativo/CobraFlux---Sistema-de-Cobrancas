-- F7 BL-008/031: ordered indexes for keyset exports (migration is transactional).
-- On live large DBs, maintenance window / CONCURRENTLY design must be approved separately.
CREATE INDEX IF NOT EXISTS idx_clients_export_order ON clients(organization_id,created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS idx_clients_export_status_order ON clients(organization_id,status,created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS idx_charges_export_order ON charges(organization_id,created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS idx_charges_export_status_order ON charges(organization_id,status,created_at DESC,id DESC);
