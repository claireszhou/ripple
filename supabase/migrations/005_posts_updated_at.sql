-- Add updated_at to posts to track edits
alter table public.posts add column updated_at timestamptz;
update public.posts set updated_at = created_at;
alter table public.posts alter column updated_at set default now();
alter table public.posts alter column updated_at set not null;

-- Trigger to auto-update updated_at on post edit
create or replace function public.set_posts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
  before update on public.posts
  for each row
  execute function public.set_posts_updated_at();
