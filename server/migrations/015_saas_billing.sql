-- Phase 6. Platform SaaS commercial ledger: NEVER JOIN to merchant charges for revenue.
-- All premium prices deliberately unconfigured until the platform owner sets a real tariff.
CREATE TABLE saas_plans(
 code text PRIMARY KEY CHECK(code IN('free','starter','business')),
 label text NOT NULL,
 monthly_price_cents bigint CHECK(monthly_price_cents IS NULL OR monthly_price_cents>=0),
 currency char(3) NOT NULL DEFAULT 'BRL' CHECK(currency='BRL'),
 clients_limit integer NOT NULL CHECK(clients_limit>0),
 services_limit integer NOT NULL CHECK(services_limit>0),
 charges_month_limit integer NOT NULL CHECK(charges_month_limit>0),
 recurrences_limit integer NOT NULL CHECK(recurrences_limit>0),
 members_limit integer NOT NULL CHECK(members_limit>0),
 messages_month_limit integer NOT NULL CHECK(messages_month_limit>0),
 published boolean NOT NULL DEFAULT false,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK((code='free' AND monthly_price_cents=0) OR (code<>'free' AND (monthly_price_cents IS NULL OR monthly_price_cents>0)))
);
INSERT INTO saas_plans(code,label,monthly_price_cents,clients_limit,services_limit,charges_month_limit,recurrences_limit,members_limit,messages_month_limit,published) VALUES
 ('free','Gratuito',0,250,60,300,50,3,100,true),
 ('starter','Starter',NULL,1000,200,2000,250,10,1000,false),
 ('business','Business',NULL,10000,2000,30000,2000,50,10000,false)
ON CONFLICT(code) DO NOTHING;
-- The one authoritative entitlements pointer per organization.
CREATE TABLE saas_subscriptions(
 organization_id uuid PRIMARY KEY REFERENCES organizations(id),
 plan_code text NOT NULL DEFAULT 'free' REFERENCES saas_plans(code),
 status text NOT NULL DEFAULT 'free' CHECK(status IN('free','trialing','active','past_due','cancelled','restricted')),
 current_period_start date NOT NULL DEFAULT CURRENT_DATE,
 current_period_end date,
 grace_until date,
 cancel_at_period_end boolean NOT NULL DEFAULT false,
 provider text,
 provider_subscription_id text UNIQUE,
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK((plan_code='free' AND status='free' AND provider_subscription_id IS NULL) OR
       (plan_code<>'free' AND status<>'free')),
 CHECK(current_period_end IS NULL OR current_period_end>=current_period_start)
);
INSERT INTO saas_subscriptions(organization_id)
SELECT id FROM organizations ON CONFLICT(organization_id) DO NOTHING;
CREATE OR REPLACE FUNCTION saas_install_free()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 INSERT INTO saas_subscriptions(organization_id) VALUES(NEW.id)
 ON CONFLICT(organization_id) DO NOTHING;
 RETURN NEW;
END;
$$;
CREATE TRIGGER trg_saas_install_free
AFTER INSERT ON organizations FOR EACH ROW EXECUTE FUNCTION saas_install_free();
CREATE TABLE saas_coupons(
 id uuid PRIMARY KEY,
 code text NOT NULL UNIQUE CHECK(code ~ '^[A-Z0-9_-]{4,32}$'),
 percent_off integer CHECK(percent_off BETWEEN 1 AND 90),
 fixed_off_cents bigint CHECK(fixed_off_cents>0),
 max_redemptions integer CHECK(max_redemptions>0),
 redeemed_count integer NOT NULL DEFAULT 0 CHECK(redeemed_count>=0),
 active boolean NOT NULL DEFAULT true,
 expires_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK((percent_off IS NOT NULL)::int+(fixed_off_cents IS NOT NULL)::int=1)
);
CREATE TABLE saas_invoices(
 id uuid PRIMARY KEY,
 organization_id uuid NOT NULL REFERENCES organizations(id),
 plan_code text NOT NULL REFERENCES saas_plans(code),
 coupon_id uuid REFERENCES saas_coupons(id),
 base_amount_cents bigint NOT NULL CHECK(base_amount_cents>0),
 discount_cents bigint NOT NULL DEFAULT 0 CHECK(discount_cents>=0 AND discount_cents<base_amount_cents),
 total_cents bigint GENERATED ALWAYS AS(base_amount_cents-discount_cents) STORED,
 currency char(3) NOT NULL DEFAULT 'BRL' CHECK(currency='BRL'),
 status text NOT NULL DEFAULT 'draft' CHECK(status IN('draft','pending','paid','past_due','void','refunded')),
 period_start date NOT NULL,
 period_end date NOT NULL,
 due_date date NOT NULL,
 provider text,
 provider_invoice_id text UNIQUE,
 payment_verified_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(organization_id,id),
 CHECK(period_end>period_start),
 CHECK((status='paid' AND payment_verified_at IS NOT NULL AND provider_invoice_id IS NOT NULL) OR status<>'paid')
);
CREATE INDEX idx_saas_invoices_org_created ON saas_invoices(organization_id,created_at DESC);
CREATE TABLE saas_change_requests(
 id uuid PRIMARY KEY,
 organization_id uuid NOT NULL REFERENCES organizations(id),
 client_request_id uuid NOT NULL,
 requested_plan text NOT NULL REFERENCES saas_plans(code),
 invoice_id uuid NOT NULL,
 state text NOT NULL DEFAULT 'pending' CHECK(state IN('pending','fulfilled','cancelled','expired')),
 requested_by uuid NOT NULL REFERENCES users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 resolved_at timestamptz,
 UNIQUE(organization_id,client_request_id),
 FOREIGN KEY(organization_id,invoice_id) REFERENCES saas_invoices(organization_id,id)
);
CREATE UNIQUE INDEX idx_saas_pending_change_per_org ON saas_change_requests(organization_id) WHERE state='pending';
CREATE INDEX idx_saas_change_org_created ON saas_change_requests(organization_id,created_at DESC);
CREATE TABLE saas_subscription_history(
 id uuid PRIMARY KEY,
 organization_id uuid NOT NULL REFERENCES organizations(id),
 actor_id uuid REFERENCES users(id),
 action text NOT NULL,
 previous_plan text,
 new_plan text,
 previous_status text,
 new_status text,
 metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_saas_history_org_created ON saas_subscription_history(organization_id,created_at DESC);
-- Coupon discount is reserved only when a verified platform payment is ingested (later PSP stage).
-- This table must never be conflated with Asaas sandbox_issuances or merchants' charges.
