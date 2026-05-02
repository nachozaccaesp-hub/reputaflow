-- ReputaFlow — Schema SQL
-- Ejecutar en Supabase SQL Editor

-- ─── clients ──────────────────────────────────────────────────────────────────
create table if not exists clients (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  business_name        text not null,
  whatsapp_number      text not null,
  google_place_id      text not null,
  google_access_token  text,
  google_refresh_token text,
  tone_instructions    text default 'tono profesional y cercano, responde siempre en español',
  plan                 text not null default 'standard',
  active               boolean not null default true,
  created_at           timestamptz not null default now()
);

alter table clients enable row level security;

create policy "service role full access on clients"
  on clients for all
  using (true)
  with check (true);

-- ─── reviews ──────────────────────────────────────────────────────────────────
create table if not exists reviews (
  id               uuid primary key default gen_random_uuid(),
  client_id        uuid not null references clients(id) on delete cascade,
  google_review_id text not null unique,
  author_name      text not null,
  rating           int not null check (rating between 1 and 5),
  text             text,
  published_at     timestamptz,
  status           text not null default 'pending'
                     check (status in ('pending','approved','published','ignored')),
  created_at       timestamptz not null default now()
);

create index if not exists reviews_client_id_idx on reviews(client_id);
create index if not exists reviews_status_idx on reviews(status);

alter table reviews enable row level security;

create policy "service role full access on reviews"
  on reviews for all
  using (true)
  with check (true);

-- ─── responses ────────────────────────────────────────────────────────────────
create table if not exists responses (
  id                 uuid primary key default gen_random_uuid(),
  review_id          uuid not null references reviews(id) on delete cascade,
  draft              text,
  final              text,
  approved_at        timestamptz,
  published_at       timestamptz,
  twilio_message_sid text,
  created_at         timestamptz not null default now()
);

create index if not exists responses_review_id_idx on responses(review_id);

alter table responses enable row level security;

create policy "service role full access on responses"
  on responses for all
  using (true)
  with check (true);

-- ─── weekly_summaries ─────────────────────────────────────────────────────────
create table if not exists weekly_summaries (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid not null references clients(id) on delete cascade,
  week_start          date not null,
  reviews_received    int not null default 0,
  reviews_responded   int not null default 0,
  avg_rating          numeric(3,2),
  sent_at             timestamptz,
  unique (client_id, week_start)
);

alter table weekly_summaries enable row level security;

create policy "service role full access on weekly_summaries"
  on weekly_summaries for all
  using (true)
  with check (true);
