-- Add posted_date and posted_period for AM/PM limit (2 posts per day max)
alter table public.posts add column posted_date date;
alter table public.posts add column posted_period text check (posted_period in ('AM', 'PM'));

-- Backfill existing posts using created_at in UTC
update public.posts
set
  posted_date = (created_at at time zone 'UTC')::date,
  posted_period = case when extract(hour from (created_at at time zone 'UTC')) < 12 then 'AM' else 'PM' end
where posted_date is null;

alter table public.posts alter column posted_date set not null;
alter table public.posts alter column posted_period set not null;

-- Enforce max 1 post per user per AM/PM slot per day
create unique index posts_user_date_period_unique
  on public.posts (user_id, posted_date, posted_period);
