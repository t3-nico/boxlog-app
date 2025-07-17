# Database Schema

## Core Tables Structure

### Users Table
Managed by Supabase Auth

```sql
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Tags Table
Hierarchical tag system with parent-child relationships

```sql
tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  icon TEXT DEFAULT 'TagIcon',
  parent_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Smart Folders Table
Dynamic filtering rules for tasks

```sql
smart_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL, -- Filter rules as JSON
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'FolderIcon',
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Tasks/Items Table
Main task management table

```sql
items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

### Item-Tag Relationships
Many-to-many relationship between items and tags

```sql
item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(item_id, tag_id)
)
```

## Key Relationships

### User Relationships
- **Users → Tags**: One-to-many (each user has their own tags)
- **Users → Smart Folders**: One-to-many (each user has their own smart folders)
- **Users → Items**: One-to-many (each user has their own items)

### Tag Relationships
- **Tags → Tags**: Self-referencing (parent-child hierarchy, max 3 levels)
- **Items ↔ Tags**: Many-to-many (items can have multiple tags, tags can be on multiple items)

### Smart Folder Rules
Smart folders use JSONB rules for dynamic filtering:

```json
{
  "conditions": [
    {
      "field": "status",
      "operator": "equals",
      "value": "pending"
    },
    {
      "field": "priority",
      "operator": "in",
      "value": ["high", "urgent"]
    }
  ],
  "operator": "AND"
}
```

## Data Types and Constraints

### Status Values
- `pending` - Task not started
- `in_progress` - Task currently being worked on
- `completed` - Task finished

### Priority Values
- `low` - Low priority task
- `medium` - Medium priority task (default)
- `high` - High priority task
- `urgent` - Urgent priority task

### Tag Hierarchy
- Maximum 3 levels of nesting
- Root tags: `parent_id` is NULL
- Child tags: `parent_id` references parent tag
- Grandchild tags: `parent_id` references child tag

## Indexes

### Performance Indexes
```sql
-- User-based queries
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_smart_folders_user_id ON smart_folders(user_id);

-- Tag hierarchy queries
CREATE INDEX idx_tags_parent_id ON tags(parent_id);
CREATE INDEX idx_tags_order_index ON tags(order_index);

-- Item status and priority queries
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_priority ON items(priority);
CREATE INDEX idx_items_due_date ON items(due_date);

-- Tag association queries
CREATE INDEX idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX idx_item_tags_tag_id ON item_tags(tag_id);
```

## Common Queries

### Get User's Tags Hierarchy
```sql
WITH RECURSIVE tag_hierarchy AS (
  -- Root tags
  SELECT id, name, color, icon, parent_id, user_id, order_index, 0 as level
  FROM tags 
  WHERE parent_id IS NULL AND user_id = $1
  
  UNION ALL
  
  -- Child tags
  SELECT t.id, t.name, t.color, t.icon, t.parent_id, t.user_id, t.order_index, th.level + 1
  FROM tags t
  JOIN tag_hierarchy th ON t.parent_id = th.id
  WHERE th.level < 2  -- Max 3 levels (0, 1, 2)
)
SELECT * FROM tag_hierarchy ORDER BY level, order_index;
```

### Get Items with Tags
```sql
SELECT i.*, array_agg(t.name) as tag_names
FROM items i
LEFT JOIN item_tags it ON i.id = it.item_id
LEFT JOIN tags t ON it.tag_id = t.id
WHERE i.user_id = $1
GROUP BY i.id
ORDER BY i.created_at DESC;
```

### Get Smart Folder Items
```sql
-- Example for status-based smart folder
SELECT * FROM items 
WHERE user_id = $1 
AND status = 'pending'
AND priority IN ('high', 'urgent')
ORDER BY created_at DESC;
```

## Security Considerations

### Row Level Security (RLS)
All tables should have RLS enabled to ensure users can only access their own data:

```sql
-- Enable RLS on all tables
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can only access their own tags" ON tags
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own items" ON items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own smart folders" ON smart_folders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own item tags" ON item_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM items 
      WHERE items.id = item_tags.item_id 
      AND items.user_id = auth.uid()
    )
  );
```

## Migration Scripts

### Initial Schema Creation
```sql
-- Create users table (handled by Supabase Auth)

-- Create tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  icon TEXT DEFAULT 'TagIcon',
  parent_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create smart_folders table
CREATE TABLE smart_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  icon TEXT DEFAULT 'FolderIcon',
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP,
  completed_at TIMESTAMP,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create item_tags table
CREATE TABLE item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(item_id, tag_id)
);
```

### Data Validation
```sql
-- Add constraints for status values
ALTER TABLE items ADD CONSTRAINT check_status 
  CHECK (status IN ('pending', 'in_progress', 'completed'));

-- Add constraints for priority values
ALTER TABLE items ADD CONSTRAINT check_priority 
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Add constraint for tag hierarchy depth
CREATE OR REPLACE FUNCTION check_tag_depth() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NOT NULL THEN
    -- Check if parent exists and calculate depth
    WITH RECURSIVE parent_chain AS (
      SELECT id, parent_id, 1 as depth
      FROM tags WHERE id = NEW.parent_id
      
      UNION ALL
      
      SELECT t.id, t.parent_id, pc.depth + 1
      FROM tags t
      JOIN parent_chain pc ON t.id = pc.parent_id
      WHERE pc.depth < 10 -- Prevent infinite recursion
    )
    SELECT MAX(depth) INTO depth_count FROM parent_chain;
    
    IF depth_count >= 3 THEN
      RAISE EXCEPTION 'Tag hierarchy cannot exceed 3 levels';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_tag_depth
  BEFORE INSERT OR UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION check_tag_depth();
```