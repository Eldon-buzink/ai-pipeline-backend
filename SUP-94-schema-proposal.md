# SUP-94 — Data Model Proposal

## Overview

Schema for an AI pipeline dashboard tracking agents, ticket execution, LLM costs, and reasoning chains. Built on Supabase with Row Level Security.

---

## Tables

### 1. `agents`

Registered agents in the pipeline.

| Column              | Type                  | Constraints                        |
|---------------------|-----------------------|-------------------------------------|
| `id`                | `uuid`                | PK, default `gen_random_uuid()`     |
| `name`              | `text`                | NOT NULL, unique                    |
| `slug`              | `text`                | NOT NULL, unique (e.g. `dev-agent`) |
| `description`       | `text`                |                                     |
| `type`              | `agent_type`          | ENUM (see below)                    |
| `is_active`         | `boolean`             | DEFAULT `true`                      |
| `created_at`        | `timestamptz`         | DEFAULT `now()`                     |
| `updated_at`        | `timestamptz`         | DEFAULT `now()`                     |

**`agent_type` enum:** `triage`, `research`, `pm`, `planner`, `dev`, `refactor`, `security`, `seo_aeo`, `review_qa`, `orchestrator`

---

### 2. `projects`

High-level initiatives grouping tickets.

| Column              | Type                  | Constraints                        |
|---------------------|-----------------------|-------------------------------------|
| `id`                | `uuid`                | PK, default `gen_random_uuid()`     |
| `name`              | `text`                | NOT NULL                            |
| `slug`              | `text`                | NOT NULL, unique                    |
| `linear_team_id`    | `text`                | nullable                            |
| `status`            | `project_status`      | ENUM: `active`, `paused`, `archived` |
| `created_at`        | `timestamptz`         | DEFAULT `now()`                     |
| `updated_at`        | `timestamptz`         | DEFAULT `now()`                     |

---

### 3. `tickets`

Linear tickets synced or manually created for pipeline tracking.

| Column                  | Type                  | Constraints                        |
|-------------------------|-----------------------|-------------------------------------|
| `id`                    | `uuid`                | PK, default `gen_random_uuid()`     |
| `linear_id`             | `text`                | unique, nullable                    |
| `identifier`            | `text`                | NOT NULL, unique (e.g. `POW-94`)   |
| `title`                 | `text`                | NOT NULL                            |
| `description`           | `text`                |                                     |
| `project_id`            | `uuid`                | FK → `projects.id`, nullable        |
| `status`                | `ticket_status`       | ENUM (see below)                    |
| `priority`              | `integer`             | DEFAULT 0                           |
| `assigned_agent_id`     | `uuid`                | FK → `agents.id`, nullable          |
| `est_cost_cents`        | `integer`             | nullable (estimated LLM cost)       |
| `actual_cost_cents`     | `integer`             | DEFAULT 0                           |
| `started_at`            | `timestamptz`         | nullable                            |
| `completed_at`          | `timestamptz`         | nullable                            |
| `created_at`            | `timestamptz`         | DEFAULT `now()`                     |
| `updated_at`            | `timestamptz`         | DEFAULT `now()`                     |

**`ticket_status` enum:** `inbox`, `triaging`, `researching`, `spec_writing`, `planning`, `in_progress`, `in_review`, `blocked`, `done`, `cancelled`

---

### 4. `runs`

Individual agent execution instances on a ticket.

| Column              | Type                  | Constraints                        |
|---------------------|-----------------------|-------------------------------------|
| `id`                | `uuid`                | PK, default `gen_random_uuid()`     |
| `ticket_id`         | `uuid`                | FK → `tickets.id`, NOT NULL         |
| `agent_id`          | `uuid`                | FK → `agents.id`, NOT NULL          |
| `trigger`           | `run_trigger`         | ENUM: `manual`, `webhook`, `cron`, `heartbeat` |
| `status`            | `run_status`          | ENUM: `pending`, `running`, `success`, `failed`, `cancelled` |
| `started_at`        | `timestamptz`         | NOT NULL, DEFAULT `now()`           |
| `completed_at`      | `timestamptz`         | nullable                            |
| `duration_ms`       | `integer`             | nullable                            |
| `input_tokens`      | `integer`             | DEFAULT 0                           |
| `output_tokens`     | `integer`             | DEFAULT 0                           |
| `cost_cents`        | `integer`             | DEFAULT 0                           |
| `error_message`     | `text`                | nullable                            |
| `created_at`        | `timestamptz`         | DEFAULT `now()`                     |

---

### 5. `logs`

Structured log entries from agent runs.

| Column              | Type                  | Constraints                        |
|---------------------|-----------------------|-------------------------------------|
| `id`                | `uuid`                | PK, default `gen_random_uuid()`     |
| `run_id`            | `uuid`                | FK → `runs.id`, NOT NULL            |
| `level`             | `log_level`           | ENUM: `debug`, `info`, `warn`, `error` |
| `step`              | `text`                | nullable (e.g. `fetch_ticket`, `parse_ac`) |
| `message`           | `text`                | NOT NULL                            |
| `metadata`          | `jsonb`               | DEFAULT `'{}'`                      |
| `created_at`        | `timestamptz`         | DEFAULT `now()`                     |

---

### 6. `reasoning`

Agent reasoning / chain-of-thought snapshots.

| Column              | Type                  | Constraints                        |
|---------------------|-----------------------|-------------------------------------|
| `id`                | `uuid`                | PK, default `gen_random_uuid()`     |
| `run_id`            | `uuid`                | FK → `runs.id`, NOT NULL            |
| `step_name`         | `text`                | NOT NULL (e.g. `check_ac`, `decide_mode`) |
| `prompt`            | `text`                | truncated to 1000 chars             |
| `response`          | `text`                | truncated to 2000 chars             |
| `model`             | `text`                | (e.g. `kimi-k2-6`)                  |
| `tokens_used`       | `integer`             | DEFAULT 0                           |
| `cost_cents`        | `integer`             | DEFAULT 0                           |
| `latency_ms`        | `integer`             | nullable                            |
| `created_at`        | `timestamptz`         | DEFAULT `now()`                     |

---

### 7. `costs`

Aggregated and line-item LLM usage costs.

| Column              | Type                  | Constraints                        |
|---------------------|-----------------------|-------------------------------------|
| `id`                | `uuid`                | PK, default `gen_random_uuid()`     |
| `run_id`            | `uuid`                | FK → `runs.id`, NOT NULL            |
| `provider`          | `text`                | NOT NULL (e.g. `openrouter`)       |
| `model`             | `text`                | NOT NULL (e.g. `moonshotai/kimi-k2-6`) |
| `endpoint`          | `text`                | nullable                            |
| `input_tokens`      | `integer`             | NOT NULL, DEFAULT 0                |
| `output_tokens`     | `integer`             | NOT NULL, DEFAULT 0                |
| `input_cost_cents`  | `integer`             | NOT NULL, DEFAULT 0                |
| `output_cost_cents` | `integer`             | NOT NULL, DEFAULT 0                |
| `total_cost_cents`  | `integer`             | NOT NULL, DEFAULT 0                |
| `currency`          | `text`                | DEFAULT `'usd'`                     |
| `recorded_at`       | `timestamptz`         | DEFAULT `now()`                     |

---

### 8. `users`

Team members (auto-created from Linear or manual). Supabase Auth integration.

| Column              | Type                  | Constraints                        |
|---------------------|-----------------------|-------------------------------------|
| `id`                | `uuid`                | PK, default `gen_random_uuid()`     |
| `email`             | `text`                | NOT NULL, unique                    |
| `full_name`         | `text`                | nullable                            |
| `linear_id`         | `text`                | unique, nullable                    |
| `role`              | `user_role`           | ENUM: `admin`, `member`, `viewer`   |
| `is_active`         | `boolean`             | DEFAULT `true`                      |
| `created_at`        | `timestamptz`         | DEFAULT `now()`                     |
| `updated_at`        | `timestamptz`         | DEFAULT `now()`                     |

---

## Indexes

```sql
-- Ticket lookups
CREATE INDEX idx_tickets_project ON tickets(project_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_assigned ON tickets(assigned_agent_id);
CREATE INDEX idx_tickets_identifier ON tickets(identifier);
CREATE INDEX idx_tickets_created ON tickets(created_at);

-- Run analytics
CREATE INDEX idx_runs_ticket ON runs(ticket_id);
CREATE INDEX idx_runs_agent ON runs(agent_id);
CREATE INDEX idx_runs_status ON runs(status);
CREATE INDEX idx_runs_started ON runs(started_at);

-- Log search
CREATE INDEX idx_logs_run ON logs(run_id);
CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_created ON logs(created_at);

-- Reasoning retrieval
CREATE INDEX idx_reasoning_run ON reasoning(run_id);
CREATE INDEX idx_reasoning_step ON reasoning(step_name);

-- Cost aggregation
CREATE INDEX idx_costs_run ON costs(run_id);
CREATE INDEX idx_costs_provider ON costs(provider);
CREATE INDEX idx_costs_recorded ON costs(recorded_at);
```

## RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reasoning ENABLE ROW LEVEL SECURITY;
ALTER TABLE costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read agents and projects
CREATE POLICY "Authenticated read agents"
  ON agents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated read projects"
  ON projects FOR SELECT TO authenticated USING (true);

-- Tickets: all authenticated can read, only admins can write
CREATE POLICY "Authenticated read tickets"
  ON tickets FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin write tickets"
  ON tickets FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Runs: readable by all authenticated, write by system (service_role)
CREATE POLICY "Authenticated read runs"
  ON runs FOR SELECT TO authenticated USING (true);

-- Logs: readable by all authenticated, write by system
CREATE POLICY "Authenticated read logs"
  ON logs FOR SELECT TO authenticated USING (true);

-- Reasoning: readable by all authenticated, write by system
CREATE POLICY "Authenticated read reasoning"
  ON reasoning FOR SELECT TO authenticated USING (true);

-- Costs: readable by all authenticated, write by system
CREATE POLICY "Authenticated read costs"
  ON costs FOR SELECT TO authenticated USING (true);

-- Users: self-read, admin-all
CREATE POLICY "Self read users"
  ON users FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "Admin all users"
  ON users FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));
```

## Functions & Triggers

```sql
-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Migrations File Layout

```
supabase/
  migrations/
    001_create_enums.sql
    002_create_agents.sql
    003_create_projects.sql
    004_create_tickets.sql
    005_create_runs.sql
    006_create_logs.sql
    007_create_reasoning.sql
    008_create_costs.sql
    009_create_users.sql
    010_create_indexes.sql
    011_create_rls_policies.sql
    012_create_triggers.sql
```

## Notes / Open Questions

1. **Linear sync** — Should `tickets` auto-sync with Linear webhooks or manual import? A `linear_synced_at` column may be useful.
2. **Cost attribution** — `costs` is per-run per-provider. If a single run hits multiple providers (e.g. OpenRouter fallback), multiple rows. Is aggregation by ticket done in SQL views or app layer?
3. **Reasoning retention** — Full prompts/responses may be large. The `prompt`/`response` columns are truncated. Store full content in Supabase Storage with a reference, or keep raw in `logs.metadata`?
4. **Users table vs Supabase Auth** — Should `users` be a mirror of Supabase Auth `auth.users`, or separated with a `auth_user_id` FK? Proposal uses separate table with manual role management.
5. **Ticket → Run cardinality** — One ticket may have multiple runs (re-runs, retries). `runs` captures each execution. Ticket-level cost is a rollup (or computed column).

---

*Review this proposal — approve or flag changes, then I'll generate the migration files.*
