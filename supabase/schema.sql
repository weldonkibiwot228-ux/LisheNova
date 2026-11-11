-- AfyaPlate Supabase backend foundation
-- Safe to run in the Supabase SQL Editor.
-- Public visitors can submit feedback and pending community posts.
-- Only a user explicitly registered in ceo_admins can view private records or moderate posts.

create extension if not exists pgcrypto;

create table if not exists public.ceo_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name varchar(40) not null check (char_length(trim(name)) between 2 and 40),
  topic text not null check (topic in (
    'Kenyan meal ideas',
    'Budget tips',
    'Cooking questions',
    'Meal-planning wins',
    'Food and nutrition'
  )),
  message varchar(700) not null check (char_length(trim(message)) between 8 and 700),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_at timestamptz
);

create index if not exists community_posts_public_feed_idx
  on public.community_posts (created_at desc)
  where status = 'approved';

create index if not exists community_posts_pending_idx
  on public.community_posts (created_at desc)
  where status = 'pending';

create table if not exists public.client_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  display_name varchar(80),
  rating smallint check (rating between 1 and 5),
  message varchar(2000) not null check (char_length(trim(message)) between 3 and 2000),
  page_path text,
  source text not null default 'website'
);

create index if not exists client_feedback_created_at_idx
  on public.client_feedback (created_at desc);

alter table public.ceo_admins enable row level security;
alter table public.community_posts enable row level security;
alter table public.client_feedback enable row level security;

-- Remove any earlier policies with these names so this script is repeatable.
drop policy if exists "CEO can read own admin registration" on public.ceo_admins;
drop policy if exists "Public can read approved community posts" on public.community_posts;
drop policy if exists "Public can submit pending community posts" on public.community_posts;
drop policy if exists "CEO can read all community posts" on public.community_posts;
drop policy if exists "CEO can moderate community posts" on public.community_posts;
drop policy if exists "CEO can delete community posts" on public.community_posts;
drop policy if exists "Public can submit feedback" on public.client_feedback;
drop policy if exists "CEO can read client feedback" on public.client_feedback;

create policy "CEO can read own admin registration"
  on public.ceo_admins for select to authenticated
  using (user_id = auth.uid());

create policy "Public can read approved community posts"
  on public.community_posts for select to anon, authenticated
  using (status = 'approved');

create policy "Public can submit pending community posts"
  on public.community_posts for insert to anon, authenticated
  with check (status = 'pending' and reviewed_at is null);

create policy "CEO can read all community posts"
  on public.community_posts for select to authenticated
  using (exists (
    select 1 from public.ceo_admins a where a.user_id = auth.uid()
  ));

create policy "CEO can moderate community posts"
  on public.community_posts for update to authenticated
  using (exists (
    select 1 from public.ceo_admins a where a.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.ceo_admins a where a.user_id = auth.uid()
  ));

create policy "CEO can delete community posts"
  on public.community_posts for delete to authenticated
  using (exists (
    select 1 from public.ceo_admins a where a.user_id = auth.uid()
  ));

create policy "Public can submit feedback"
  on public.client_feedback for insert to anon, authenticated
  with check (true);

create policy "CEO can read client feedback"
  on public.client_feedback for select to authenticated
  using (exists (
    select 1 from public.ceo_admins a where a.user_id = auth.uid()
  ));

-- Explicit grants; row-level security above remains the access control boundary.
grant select on public.ceo_admins to authenticated;
grant select, insert, update, delete on public.community_posts to anon, authenticated;
grant select, insert on public.client_feedback to anon, authenticated;
