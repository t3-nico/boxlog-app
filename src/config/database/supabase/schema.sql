create table tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  color text default '#3b82f6',      -- Tailwind blue-500 を初期値に
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
create policy "individual_access" on tags for all to authenticated using (true);

-- Supabase function で depth ≥ 4 の挿入／更新を拒否する（raise exception）。
create or replace function check_tag_depth() 
returns trigger as $$
begin
  if (new.depth >= 4) then
    raise exception 'Tag depth cannot be 4 or greater';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger tags_depth_check
  before insert or update on tags
  for each row execute procedure check_tag_depth();