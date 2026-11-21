-- Fase 7: respostas de suporte persistidas no portal. Nenhum e-mail é enviado por esta migração.
-- Contatos públicos não autenticados não podem receber respostas pelo portal de uma organização.
CREATE TABLE support_ticket_replies(
  id uuid PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES support_tickets(id),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  actor_id uuid NOT NULL REFERENCES users(id),
  client_request_id uuid NOT NULL,
  message text NOT NULL CHECK(length(trim(message)) BETWEEN 10 AND 3000),
  delivery_state text NOT NULL DEFAULT 'portal_only' CHECK(delivery_state='portal_only'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ticket_id,client_request_id)
);
CREATE INDEX idx_support_ticket_replies_ticket ON support_ticket_replies(ticket_id,created_at,id);
CREATE INDEX idx_support_ticket_replies_org ON support_ticket_replies(organization_id,ticket_id);
-- O histórico é imutável no fluxo operacional. Retenção/descarte exigem governança LGPD específica.
CREATE OR REPLACE FUNCTION cobraflux_reply_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'support ticket replies are append-only';
END;
$$;
CREATE TRIGGER trg_support_ticket_replies_append_only
BEFORE UPDATE OR DELETE ON support_ticket_replies
FOR EACH ROW EXECUTE FUNCTION cobraflux_reply_append_only();
