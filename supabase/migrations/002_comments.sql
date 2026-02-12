-- Comments table
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null,
  constraint comment_content_length check (char_length(content) <= 280 and char_length(content) > 0)
);

create index comments_post_id_idx on public.comments (post_id);
create index comments_created_at_idx on public.comments (created_at asc);

alter table public.comments enable row level security;

create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Authenticated users can insert comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = user_id);
