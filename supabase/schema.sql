create table if not exists event (
  id            int primary key default 1 check (id = 1),
  room_password text not null default 'CHANGE-ME',
  state         text not null default 'lobby',   -- lobby | running | ended
  started_at    timestamptz
);
insert into event (id) values (1) on conflict do nothing;

create table if not exists teams (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  created_at  timestamptz not null default now(),
  started_at  timestamptz,
  finished_at timestamptz,
  locked_until timestamptz,
  active_card text                                  -- card they are committed to
);

create table if not exists progress (
  team_id   uuid references teams(id) on delete cascade,
  card_id   text not null,
  state     jsonb not null default '{}',            -- server-side game state
  opened_at timestamptz not null default now(),
  solved_at timestamptz,
  attempts  int not null default 0,
  primary key (team_id, card_id)
);

create table if not exists keys (
  team_id  uuid references teams(id) on delete cascade,
  position int not null,
  value    text not null,
  card_id  text not null,
  won_at   timestamptz not null default now(),
  primary key (team_id, position)
);

create table if not exists logs (
  id      bigserial primary key,
  team_id uuid references teams(id) on delete cascade,
  kind    text not null,
  card_id text,
  detail  text,
  at      timestamptz not null default now()
);
create index if not exists logs_team_at on logs(team_id, at desc);

-- everything goes through the service role, so no public access
alter table teams    enable row level security;
alter table progress enable row level security;
alter table keys     enable row level security;
alter table logs     enable row level security;
alter table event    enable row level security;