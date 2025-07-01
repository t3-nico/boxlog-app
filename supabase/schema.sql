create table tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  color text default '#3b82f6',
  parent_id uuid references tags(id) on delete cascade,
  depth smallint generated always as (
    coalesce(
      (with recursive cte as (
        select id, parent_id, 1 as d from tags where id = tags.id
        union all
        select t.id, t.parent_id, d + 1 from tags t join cte on t.id = cte.parent_id
      ) select max(d) from cte), 1)
  ) stored,
  created_at timestamptz default now()
);
create index on tags(parent_id);
-- policy should be adjusted to existing RLS settings
-- placeholder for row level security policy
create policy "individual_access" on tags for all using (auth.uid() = auth.uid());

-- function to prevent depth >= 4
create or replace function check_tag_depth()
returns trigger as $$
begin
  if (new.depth >= 4) then
    raise exception 'Tag depth cannot exceed 3';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tags_depth_trigger
  before insert or update on tags
  for each row execute function check_tag_depth();
