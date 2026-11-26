-- Explicit per-organization choice of a Meta-approved, utility-only due reminder template.
ALTER TABLE whatsapp_accounts
  ADD COLUMN default_template_id uuid;
ALTER TABLE whatsapp_accounts
  ADD CONSTRAINT whatsapp_default_template_same_tenant
  FOREIGN KEY (organization_id,default_template_id)
  REFERENCES whatsapp_templates(organization_id,id);
