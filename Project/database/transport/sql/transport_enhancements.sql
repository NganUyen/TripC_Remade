-- Create User Search History Table
create table if not exists public.user_search_history (
  id uuid primary key default gen_random_uuid(),
  user_id text not null, -- references auth.users(id) but using text for cleaner clerk integration if needed, or uuid if pure supabase auth
  origin text not null,
  destination text not null,
  search_date timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Index for faster queries by user
create index if not exists idx_user_search_history_user_id on public.user_search_history(user_id);
create index if not exists idx_user_search_history_created_at on public.user_search_history(created_at desc);

-- RLS Policies
alter table public.user_search_history enable row level security;

create policy "Users can view their own search history"
  on public.user_search_history for select
  using (auth.uid()::text = user_id);

create policy "Users can insert their own search history"
  on public.user_search_history for insert
  with check (auth.uid()::text = user_id);

create policy "Users can delete their own search history"
  on public.user_search_history for delete
  using (auth.uid()::text = user_id);

-- Dummy Data Generator for Popular Transfers (Optional / For Dev)
-- This assumes a 'transport_routes' table exists. 
-- If not, we serve recommendations based on history or static fallbacks.
