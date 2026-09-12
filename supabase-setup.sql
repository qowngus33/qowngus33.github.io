-- Run as project owner in Supabase SQL Editor. No existing data is deleted.
begin;
create table if not exists public.journey_guestbook (
 id uuid primary key,
 name text not null check (char_length(btrim(name)) between 1 and 24),
 message text not null default '' check (char_length(message) <= 160),
 stars integer not null check (stars between 0 and 8),
 coins integer not null check (coins between 0 and 35),
 created_at timestamptz not null default now(),
 approved boolean not null default true
);
-- Upgrade the previous 7-star constraint without deleting existing visits.
alter table public.journey_guestbook drop constraint if exists journey_guestbook_stars_check;
alter table public.journey_guestbook add constraint journey_guestbook_stars_check check (stars between 0 and 8);
-- Also upgrades existing v4 installations. Old hidden rows remain hidden.
alter table public.journey_guestbook alter column approved set default true;
create index if not exists journey_guestbook_created on public.journey_guestbook(created_at desc);
alter table public.journey_guestbook enable row level security;
revoke all on public.journey_guestbook from public, anon, authenticated;

create or replace function public.journey_list_entries()
returns table(name text, message text, stars integer, coins integer, created_at timestamptz)
language sql stable security definer set search_path = ''
as $$
 select g.name, g.message, g.stars, g.coins, g.created_at
 from public.journey_guestbook g where g.approved
 order by g.created_at desc, g.id desc limit 20;
$$;

create or replace function public.journey_submit_entry(
 p_id uuid, p_name text, p_message text, p_stars integer, p_coins integer
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
 if p_id is null or p_name is null or char_length(btrim(p_name)) not between 1 and 24
 or p_message is null or char_length(p_message) > 160
 or p_stars is null or p_stars not between 0 and 8
 or p_coins is null or p_coins not between 0 and 35 then
   raise exception 'INVALID_ENTRY';
 end if;
 -- Serialize submit checks so simultaneous requests cannot bypass the limits.
 perform pg_catalog.pg_advisory_xact_lock(742081634);
 if exists(select 1 from public.journey_guestbook where id = p_id) then
   return '{"status":"received"}'::jsonb;
 end if;
 -- Global limits, not per-device limits. Protect small portfolio usage.
 if exists(select 1 from public.journey_guestbook where created_at > now() - interval '10 seconds') then
   raise exception 'PLEASE_WAIT';
 end if;
 if (select count(*) from public.journey_guestbook where created_at > now() - interval '24 hours') >= 500 then
   raise exception 'DAILY_LIMIT';
 end if;
 insert into public.journey_guestbook(id,name,message,stars,coins,approved)
 values(p_id,btrim(p_name),btrim(p_message),p_stars,p_coins,true);
 return '{"status":"received"}'::jsonb;
end;
$$;
revoke all on function public.journey_list_entries() from public, anon, authenticated;
revoke all on function public.journey_submit_entry(uuid,text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.journey_list_entries() to anon, authenticated;
grant execute on function public.journey_submit_entry(uuid,text,text,integer,integer) to anon, authenticated;
commit;
