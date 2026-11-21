-- Phase 4: recurring plans are durable, non-financial templates. Only DRAFT charges are generated.
CREATE TABLE recurrence_plans (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  client_id uuid NOT NULL REFERENCES clients(id),
  service_id uuid REFERENCES services(id),
  description text NOT NULL CHECK(length(trim(description)) BETWEEN 2 AND 300),
  amount_cents bigint NOT NULL CHECK(amount_cents>0 AND amount_cents<=10000000000),
  discount_cents bigint NOT NULL DEFAULT 0 CHECK(discount_cents>=0 AND discount_cents<amount_cents),
  frequency text NOT NULL CHECK(frequency IN ('monthly','weekly')),
  anchor_day smallint NOT NULL CHECK(anchor_day BETWEEN 1 AND 31),
  first_due_date date NOT NULL,
  next_due_date date NOT NULL,
  state text NOT NULL DEFAULT 'active' CHECK(state IN ('active','paused','cancelled')),
  created_by uuid NOT NULL REFERENCES users(id),
  lease_token uuid,
  lease_until timestamptz,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0 CHECK(attempts>=0),
  last_error text,
  generated_count integer NOT NULL DEFAULT 0 CHECK(generated_count>=0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id,id),
  CONSTRAINT recurrence_lease_pair CHECK ((lease_token IS NULL)=(lease_until IS NULL))
);
CREATE INDEX idx_recurrence_due ON recurrence_plans(next_due_date,next_attempt_at)
  WHERE state='active';
CREATE INDEX idx_recurrence_org_state ON recurrence_plans(organization_id,state,created_at DESC);
CREATE TABLE recurrence_cycles (
  id uuid PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES organizations(id),
  plan_id uuid NOT NULL,
  cycle_key text NOT NULL,
  due_date date NOT NULL,
  charge_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(plan_id,cycle_key),
  FOREIGN KEY (organization_id,plan_id) REFERENCES recurrence_plans(organization_id,id),
  FOREIGN KEY (organization_id,charge_id) REFERENCES charges(organization_id,id)
);
CREATE INDEX idx_recurrence_cycles_org_plan ON recurrence_cycles(organization_id,plan_id,due_date DESC);
CREATE TABLE recurrence_worker_runs (
  id uuid PRIMARY KEY,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  through_date date NOT NULL,
  examined integer NOT NULL DEFAULT 0 CHECK(examined>=0),
  generated integer NOT NULL DEFAULT 0 CHECK(generated>=0),
  failed integer NOT NULL DEFAULT 0 CHECK(failed>=0),
  paused integer NOT NULL DEFAULT 0 CHECK(paused>=0),
  dry_run boolean NOT NULL DEFAULT false
);
