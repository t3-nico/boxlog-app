-- Events table for calendar functionality
create table events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  
  -- Date and time fields
  start_date date not null,
  start_time time,
  end_date date,
  end_time time,
  
  -- All-day event flag
  is_all_day boolean default false,
  
  -- Event type and status
  event_type text default 'event' check (event_type in ('event', 'task', 'reminder')),
  status text default 'confirmed' check (status in ('confirmed', 'tentative', 'cancelled')),
  
  -- Color and visual customization
  color text default '#3b82f6',
  
  -- Recurrence pattern (JSON for future extensibility)
  recurrence_pattern jsonb,
  
  -- Location and additional metadata
  location text,
  url text,
  
  -- Integration with existing tags system
  -- This will be handled via a separate events_tags table similar to item_tags
  
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for performance
create index on events(user_id);
create index on events(start_date);
create index on events(start_date, end_date);
create index on events(user_id, start_date);

-- RLS policies for security
alter table events enable row level security;

create policy "Users can view their own events" 
  on events for select 
  to authenticated 
  using (auth.uid() = user_id);

create policy "Users can insert their own events" 
  on events for insert 
  to authenticated 
  with check (auth.uid() = user_id);

create policy "Users can update their own events" 
  on events for update 
  to authenticated 
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own events" 
  on events for delete 
  to authenticated 
  using (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_updated_at
  before update on events
  for each row execute procedure update_updated_at_column();

-- Events-Tags relationship table (similar to item_tags)
create table event_tags (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade not null,
  tag_id uuid references tags(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(event_id, tag_id)
);

create index on event_tags(event_id);
create index on event_tags(tag_id);

-- RLS policies for event_tags
alter table event_tags enable row level security;

create policy "Users can manage tags for their own events" 
  on event_tags for all 
  to authenticated 
  using (
    exists (
      select 1 from events 
      where events.id = event_tags.event_id 
      and events.user_id = auth.uid()
    )
  );