-- Profiles table: extends auth.users with username and profile data
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  avatar_url text,
  display_name text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Username: lowercase, alphanumeric + underscore, 3-30 chars
alter table public.profiles add constraint profiles_username_check
  check (username ~ '^[a-z0-9_]{3,30}$');

-- RLS
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Follows table
create table public.follows (
  follower_id uuid references public.profiles on delete cascade not null,
  following_id uuid references public.profiles on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (follower_id, following_id),
  check (follower_id != following_id)
);

create index follows_follower_id_idx on public.follows (follower_id);
create index follows_following_id_idx on public.follows (following_id);

alter table public.follows enable row level security;

create policy "Users can view all follows"
  on public.follows for select
  using (true);

create policy "Users can insert own follow"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can delete own follow"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- Posts table
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null,
  constraint content_length check (char_length(content) <= 280 and char_length(content) > 0)
);

create index posts_user_id_idx on public.posts (user_id);
create index posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

create policy "Users can insert own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

-- Hearts table
create table public.hearts (
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  created_at timestamptz default now() not null,
  primary key (post_id, user_id)
);

create index hearts_post_id_idx on public.hearts (post_id);
create index hearts_user_id_idx on public.hearts (user_id);

alter table public.hearts enable row level security;

create policy "Users can view all hearts"
  on public.hearts for select
  using (true);

create policy "Users can insert own heart"
  on public.hearts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own heart"
  on public.hearts for delete
  using (auth.uid() = user_id);

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, avatar_url, display_name)
  values (
    new.id,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
