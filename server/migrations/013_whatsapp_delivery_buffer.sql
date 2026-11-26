-- Callback events can arrive before the send HTTP response, so persist them for replay.
ALTER TABLE whatsapp_outbox ADD COLUMN sent_at timestamptz;
CREATE TABLE whatsapp_callback_buffer (
 id uuid PRIMARY KEY,
 organization_id uuid NOT NULL REFERENCES organizations(id),
 provider_message_id text NOT NULL,
 status text NOT NULL CHECK(status IN ('sent','delivered','read','failed')),
 provider_timestamp bigint NOT NULL,
 error_code text,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(provider_message_id,status,provider_timestamp)
);
CREATE INDEX idx_wa_cb_buffer_provider ON whatsapp_callback_buffer(provider_message_id,created_at);
