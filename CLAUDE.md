# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Run linting
npm run lint

# Run tests
npm test
```

## Architecture Overview

This is a Next.js 14 application built with TypeScript, using App Router for routing. The application is a task management system called "BoxLog" with calendar, board, and table views.

### Key Technologies

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS v4 with custom theme system
- **UI Components**: Headless UI, Radix UI primitives
- **Authentication**: Supabase Auth with custom AuthContext
- **State Management**: Zustand with persistence
- **Database**: Supabase (PostgreSQL)
- **Drag & Drop**: @dnd-kit for sortable interfaces
- **Icons**: Heroicons

### Directory Structure

- `src/app/` - Next.js App Router pages and layouts
  - `(app)/` - Main application routes (requires auth)
  - `(auth)/` - Authentication pages (login, signup, etc.)
  - `api/` - API routes for backend functionality
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions and configurations
- `src/stores/` - Zustand state management
- `src/contexts/` - React contexts (auth, theme)
- `src/styles/` - Global styles and theme definitions
- `src/config/` - Configuration files

### Theme System

The application uses a custom theme system in `src/styles/theme-simplified.css`:

- CSS variables for light/dark mode colors
- Neutral color palette (neutral-50 to neutral-950)
- Tag color preservation system using CSS variables
- Responsive hover effects with proper dark mode support

#### **IMPORTANT: Dual Theme Development Rules**

When creating new components or styles, **ALWAYS** support both light and dark modes:

**CSS Variable Pattern:**
```css
:root {
  --bg-primary: 255 255 255;     /* Light mode */
  --text-primary: 17 24 39;      /* Light mode */
}

.dark {
  --bg-primary: 31 41 55;        /* Dark mode */
  --text-primary: 249 250 251;   /* Dark mode */
}
```

**Tailwind Override Pattern:**
```css
.bg-white { background-color: rgb(var(--bg-primary)) !important; }
.text-black { color: rgb(var(--text-primary)) !important; }
/* Dark mode automatically handled by CSS variables */
```

**Color Preservation for Custom Elements:**
- Use CSS variables with `--tag-color` for tags and custom colored elements
- Example: `<div style={{'--tag-color': color}} className="tag-icon">Custom Color</div>`

**Required Testing:**
- Test all new components in both light and dark modes
- Verify hover/focus states work in both themes
- Ensure proper contrast ratios are maintained

#### Color Mapping Reference
```
Light → Dark
bg-white (255 255 255) → bg-gray-800 (31 41 55)
text-black (17 24 39) → text-white (249 250 251)
text-gray-600 (75 85 99) → text-gray-300 (209 213 219)
border-gray-200 (229 231 235) → border-gray-600 (75 85 99)
hover-gray-50 (249 250 251) → hover-gray-700 (55 65 81)
```

### Theme Development Workflow

1. **Define CSS Variables**: Always create both `:root` and `.dark` definitions
2. **Override Tailwind Classes**: Use `!important` to ensure theme variables take precedence
3. **Preserve Custom Colors**: Use `--tag-color` CSS variable for tags, status indicators, etc.
4. **Test Both Modes**: Switch between light/dark during development
5. **Check Accessibility**: Ensure proper contrast ratios in both themes

#### Example Component Creation:
```tsx
// ✅ Good: Supports both themes automatically
<div className="bg-white text-black border border-gray-200 hover:bg-gray-50">
  Content
</div>

// ✅ Good: Custom color preserved
<div style={{'--tag-color': '#ef4444'}} className="tag-icon">
  <TagIcon className="w-4 h-4" />
</div>

// ❌ Bad: Hard-coded colors that won't switch
<div style={{backgroundColor: '#ffffff', color: '#000000'}}>
  Content
</div>
```

### Authentication Flow

- Supabase Auth with SSR support
- Custom AuthContext in `src/contexts/AuthContext.tsx`
- Server-side client in `src/lib/supabase/server.ts`
- Client-side client in `src/lib/supabase/client.ts`
- Auth pages in `src/app/(auth)/`

### State Management

Primary state is managed through Zustand stores:

- `useSidebarStore` - Sidebar state, notifications, tags, smart folders
- `useBoxStore` - Task/box management and filtering
- Stores use persistence middleware for client-side storage

### Component Architecture

- **Sidebar**: Collapsible sidebar with dynamic sections
- **Tags**: Hierarchical tag system with 3-level nesting
- **Smart Folders**: Dynamic filtering rules for tasks
- **Theme Toggle**: Light/dark mode switching
- **Notifications**: Real-time notification system

### API Routes

- `/api/tags/` - Tag CRUD operations
- `/api/smart-folders/` - Smart folder management
- `/api/item-tags/` - Tag associations
- `/api/auth/refresh/` - Auth token refresh

### Key Features

1. **Multi-view System**: Calendar, Table, Board, and Stats views
2. **Hierarchical Tags**: 3-level tag nesting with custom colors and icons
3. **Smart Folders**: Rule-based task filtering
4. **Drag & Drop**: Sortable interfaces for tags and smart folders
5. **Responsive Design**: Mobile-first approach with sidebar collapse
6. **Real-time Updates**: Optimistic updates with React Query patterns

### Development Notes

- Use `src/config/sidebarConfig.ts` for sidebar menu configuration
- Tag icons are defined in `src/config/tagIcons.ts`
- **Theme colors should use CSS variables from the theme system**
- **Always test both light and dark mode implementations**
- **New components MUST support dual themes from the start**
- **Use `--tag-color` CSS variable for elements that need custom colors**
- Use TypeScript strictly - avoid `any` types where possible

### Git Workflow & Development Practices

#### When to Commit
**Commit Frequently** - Suggest commits when:
- A complete feature is working (even if small)
- Bug fixes are complete and tested
- Refactoring is done and doesn't break existing functionality
- UI improvements are complete and tested in both light/dark modes
- API endpoints are functional and tested

#### When to Create New Branches
**Create feature branches** for:
- New major features (e.g., `feature/calendar-view`, `feature/user-dashboard`)
- Significant UI overhauls (e.g., `feature/sidebar-redesign`, `feature/mobile-responsive`)
- Complex bug fixes that affect multiple components
- Experimental features that might need iteration

**Use descriptive branch names:**
```bash
# Good examples
feature/drag-drop-tasks
feature/smart-folder-system
fix/theme-toggle-persistence
refactor/component-structure
```

#### Commit Message Guidelines
Follow conventional commits format:
```
feat: add drag and drop functionality to task lists
fix: resolve dark mode toggle state persistence
refactor: simplify theme variable structure
style: improve button hover effects across components
```

#### Development Milestones
**Suggest commits/branches at these points:**
1. **Feature Complete**: When a user-facing feature works end-to-end
2. **UI Component Ready**: When a reusable component is complete with both themes
3. **API Integration**: When frontend successfully connects to backend
4. **Bug Resolution**: When an issue is fixed and tested
5. **Performance Optimization**: When improvements are measurable and stable

#### Code Review Ready Checklist
Before suggesting a commit, ensure:
- [ ] Code works in both light and dark modes
- [ ] TypeScript types are properly defined
- [ ] No console errors or warnings
- [ ] Responsive design works on mobile/desktop
- [ ] Performance is acceptable (no obvious slowdowns)
- [ ] New components follow established patterns
- [ ] Documentation is updated (see Documentation Guidelines below)

### Documentation Guidelines

#### **ALWAYS** create documentation alongside development:

#### Developer Documentation (`docs/dev/`)
**Create/update developer docs when:**
- Adding new components or architectural patterns
- Making significant API changes
- Implementing complex features or algorithms
- Adding new dependencies or build processes
- Fixing tricky bugs that others might encounter

**Developer doc structure:**
```
docs/dev/
├── components/           # Component design decisions & patterns
├── architecture/         # System design & data flow
├── api/                 # Internal API documentation
├── troubleshooting/     # Common issues & solutions
├── performance/         # Optimization notes & benchmarks
└── decisions/           # ADRs (Architecture Decision Records)
```

**Example developer doc creation:**
```markdown
# Tag System Architecture

## Problem
Users need a hierarchical tagging system that supports 3 levels of nesting...

## Solution
We implemented a tree structure using parent-child relationships...

## Trade-offs
- Performance: O(n) traversal vs O(1) lookup
- Complexity: Recursive rendering vs flat structure
- Memory: Full tree in state vs lazy loading

## Implementation Notes
- Uses Zustand for state management
- CSS variables for color preservation
- Drag-and-drop with @dnd-kit
```

#### User Documentation (`docs/user/`)
**Create/update user docs when:**
- Adding new user-facing features
- Changing UI/UX workflows
- Adding new settings or configuration options
- Fixing bugs that affected user experience
- Adding integrations or export features

**User doc structure:**
```
docs/user/
├── getting-started/     # Onboarding & basic setup
├── features/           # Feature-specific guides
├── tutorials/          # Step-by-step workflows
├── faq/               # Frequently asked questions
├── troubleshooting/   # User-facing issue resolution
└── integrations/      # Third-party connections
```

**Example user doc creation:**
```markdown
# Creating and Managing Tags

Tags help you organize your tasks and projects efficiently.

## Creating a New Tag
1. Click the "+" button next to "Tags" in the sidebar
2. Choose a name and color for your tag
3. Select an icon (optional)
4. Click "Save"

## Organizing Tags
- Drag tags to reorder them
- Create sub-tags by dragging onto parent tags
- Use up to 3 levels of hierarchy

## Pro Tips
- Use consistent color schemes for related tags
- Keep tag names short and descriptive
- Archive unused tags instead of deleting them
```

#### Documentation Workflow
1. **During Development**: Write technical notes in `docs/dev/`
2. **Feature Complete**: Create/update user guides in `docs/user/`
3. **Before Commit**: Ensure both dev and user docs are updated
4. **After Major Features**: Review and reorganize documentation structure

#### Documentation Standards
- Use clear, concise language
- Include code examples for developer docs
- Add screenshots for user docs (when applicable)
- Keep docs in sync with actual implementation
- Link related documentation together

### Continuous Improvement Practices

#### Refactoring Guidelines
**Proactively suggest refactoring when:**
- Code duplication appears across 3+ components
- Functions exceed 50 lines or have >4 parameters
- Components have >300 lines or >5 props
- Complex nested conditional logic appears
- Performance bottlenecks are identified
- TypeScript `any` types are used extensively

**Refactoring priorities:**
1. **Extract Reusable Components**: Create shared UI components
2. **Extract Custom Hooks**: Share stateful logic across components
3. **Extract Utility Functions**: Centralize common operations
4. **Optimize Renders**: Implement memoization where beneficial
5. **Simplify State**: Reduce unnecessary state complexity
6. **Improve Types**: Replace `any` with proper TypeScript types

**Example refactoring suggestion:**
```tsx
// ❌ Before: Duplicated tag rendering logic
function TagsList() {
  return tags.map(tag => (
    <div className="flex items-center gap-2">
      <TagIcon style={{color: tag.color}} />
      <span>{tag.name}</span>
    </div>
  ))
}

// ✅ After: Extracted reusable component
function TagItem({ tag }) {
  return (
    <div className="flex items-center gap-2">
      <TagIcon style={{'--tag-color': tag.color}} className="tag-icon" />
      <span>{tag.name}</span>
    </div>
  )
}
```

#### Debugging & Error Handling
**Always implement proper debugging:**
- Add meaningful error boundaries in React components
- Include descriptive error messages with context
- Log important state changes in development
- Add TypeScript strict mode compliance
- Implement graceful fallbacks for API failures

**Debugging patterns:**
```tsx
// Error boundary for component sections
<ErrorBoundary fallback={<TagLoadingError />}>
  <TagsList />
</ErrorBoundary>

// Proper error handling in async operations
try {
  const result = await apiCall()
  // Success handling
} catch (error) {
  console.error('Failed to load tags:', error)
  setError('Unable to load tags. Please try again.')
  // Fallback UI state
}

// Development-only debugging
if (process.env.NODE_ENV === 'development') {
  console.log('Tag state updated:', newTags)
}
```

#### Performance Monitoring
**Continuously monitor and optimize:**
- Use React DevTools Profiler for component performance
- Monitor bundle size with each significant change
- Check Lighthouse scores for page performance
- Implement lazy loading for heavy components
- Use code splitting for route-based optimization

**Performance checklist:**
- [ ] Large lists use virtualization or pagination
- [ ] Images are properly optimized and lazy loaded
- [ ] Heavy computations are memoized
- [ ] API calls are debounced/throttled appropriately
- [ ] Bundle size stays under reasonable limits

#### Code Quality Standards
**Maintain high code quality by:**
- Running ESLint and fixing all warnings
- Ensuring 100% TypeScript type coverage
- Writing self-documenting code with clear naming
- Adding JSDoc comments for complex functions
- Following consistent file and folder naming conventions

**Quality gates before each commit:**
```bash
# Automated checks to suggest
npm run lint          # Fix all linting issues
npm run typecheck     # Ensure TypeScript compliance
npm run test          # All tests pass
npm run build         # Production build succeeds
```

#### Technical Debt Management
**Regularly address technical debt:**
- Track TODO comments and convert to issues
- Update dependencies monthly (with testing)
- Remove unused code and dependencies
- Refactor outdated patterns to modern approaches
- Document architectural decisions and trade-offs

**Technical debt indicators:**
- Multiple TODO/FIXME comments in same area
- Workarounds that are no longer necessary
- Dependencies with security vulnerabilities
- Code patterns that don't match current standards
- Performance issues in user-facing features

#### Accessibility & UX Improvements
**Continuously improve user experience:**
- Test with keyboard navigation only
- Verify screen reader compatibility
- Ensure proper color contrast in both themes
- Add loading states for async operations
- Implement proper focus management
- Test on different screen sizes and devices

#### Security Considerations
**Always consider security implications:**
- Validate all user inputs
- Sanitize data before displaying
- Use proper authentication checks
- Avoid exposing sensitive data in client code
- Implement proper CORS and CSP headers
- Regular security dependency updates

### Common Development Patterns

#### Data Fetching Patterns
**Standard data fetching with error handling:**
```tsx
// Custom hook for data fetching
function useApiData<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api${endpoint}`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [endpoint])

  return { data, loading, error, refetch: () => fetchData() }
}

// Usage in components
function TagsList() {
  const { data: tags, loading, error } = useApiData<Tag[]>('/tags')
  
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!tags?.length) return <EmptyState message="No tags found" />
  
  return <TagList tags={tags} />
}
```

#### Form Handling Patterns
**Consistent form handling with validation:**
```tsx
// Form hook pattern
function useForm<T>(initialValues: T, validationSchema?: any) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (onSubmit: (values: T) => Promise<void>) => {
    try {
      setIsSubmitting(true)
      await onSubmit(values)
    } catch (error) {
      // Handle submission errors
    } finally {
      setIsSubmitting(false)
    }
  }

  return { values, errors, isSubmitting, handleChange, handleSubmit }
}

// Usage example
function TagEditForm({ tag, onSave }: TagEditFormProps) {
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    name: tag?.name || '',
    color: tag?.color || '#3b82f6',
    icon: tag?.icon || 'TagIcon'
  })

  return (
    <form onSubmit={e => {
      e.preventDefault()
      handleSubmit(onSave)
    }}>
      <Input
        value={values.name}
        onChange={e => handleChange('name', e.target.value)}
        error={errors.name}
      />
      {/* Other form fields */}
    </form>
  )
}
```

#### Error Handling Patterns
**Consistent error boundaries and handling:**
```tsx
// Global error boundary
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // Send to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}

// API error handling utility
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}
```

### Database Schema

#### Core Tables Structure
```sql
-- Users table (managed by Supabase Auth)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)

-- Tags table (hierarchical structure)
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

-- Smart Folders table
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

-- Tasks/Items table
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

-- Item-Tag relationships (many-to-many)
item_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(item_id, tag_id)
)
```

#### Key Relationships
- **Users → Tags**: One-to-many (each user has their own tags)
- **Tags → Tags**: Self-referencing (parent-child hierarchy, max 3 levels)
- **Users → Smart Folders**: One-to-many (each user has their own smart folders)
- **Users → Items**: One-to-many (each user has their own items)
- **Items ↔ Tags**: Many-to-many (items can have multiple tags, tags can be on multiple items)

### Testing Guidelines

#### Test Setup and Execution
```bash
# Run all tests
npm run test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm run test TagsList.test.tsx

# Run tests matching pattern
npm run test:pattern "tag"
```

#### Testing Patterns
```tsx
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react'
import { TagEditDialog } from './TagEditDialog'

describe('TagEditDialog', () => {
  const mockTag = {
    id: '1',
    name: 'Work',
    color: '#3b82f6',
    icon: 'BriefcaseIcon'
  }

  it('should render tag edit form with pre-filled values', () => {
    render(<TagEditDialog tag={mockTag} open={true} onClose={jest.fn()} />)
    
    expect(screen.getByDisplayValue('Work')).toBeInTheDocument()
    expect(screen.getByDisplayValue('#3b82f6')).toBeInTheDocument()
  })

  it('should call onSave with updated tag data', async () => {
    const mockOnSave = jest.fn()
    render(<TagEditDialog tag={mockTag} open={true} onSave={mockOnSave} />)
    
    fireEvent.change(screen.getByDisplayValue('Work'), { target: { value: 'Personal' } })
    fireEvent.click(screen.getByText('Save'))
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockTag,
        name: 'Personal'
      })
    })
  })
})

// Custom hook testing
import { renderHook, act } from '@testing-library/react'
import { useApiData } from './useApiData'

describe('useApiData', () => {
  it('should fetch data successfully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([mockTag])
    })

    const { result } = renderHook(() => useApiData('/tags'))
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.data).toEqual([mockTag])
      expect(result.current.error).toBe(null)
    })
  })
})
```

### Environment Variables

#### Required Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # Server-side only

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000 # or production URL
NODE_ENV=development # development, production, test

# Optional: Analytics & Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
SENTRY_DSN=your_sentry_dsn # Error tracking

# Optional: Feature Flags
NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES=false
```

#### Environment Setup
```bash
# Development setup
cp .env.example .env.local
# Edit .env.local with your values

# Production deployment (Vercel example)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### Code Style Guidelines

#### Naming Conventions
```tsx
// ✅ Components: PascalCase
export function TagEditDialog() {}
export function SmartFolderList() {}

// ✅ Variables and functions: camelCase
const tagCount = 5
const handleTagUpdate = () => {}

// ✅ Constants: SCREAMING_SNAKE_CASE
const API_ENDPOINTS = {
  TAGS: '/api/tags',
  SMART_FOLDERS: '/api/smart-folders'
}

// ✅ Types and interfaces: PascalCase
interface TagEditDialogProps {
  tag: Tag
  onSave: (tag: Tag) => void
}

// ✅ File names: kebab-case for components, camelCase for utilities
TagEditDialog.tsx → tag-edit-dialog.tsx
useApiData.ts → useApiData.ts (hooks exception)
```

#### TypeScript Best Practices
```tsx
// ✅ Strict typing, avoid 'any'
interface Tag {
  id: string
  name: string
  color: string
  icon: string
  parentId: string | null
}

// ✅ Use generic types for reusable components
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  onItemClick?: (item: T) => void
}

// ✅ Use union types for controlled values
type TaskStatus = 'pending' | 'in_progress' | 'completed'
type Priority = 'low' | 'medium' | 'high' | 'urgent'

// ✅ Use optional properties appropriately
interface CreateTagRequest {
  name: string
  color: string
  icon?: string
  parentId?: string
}
```

### Troubleshooting

#### Common Issues and Solutions

**1. Theme/CSS Issues:**
```
Problem: Dark mode colors not applying
Solution: Check if CSS variables are properly defined in both :root and .dark selectors
Location: src/styles/theme-simplified.css
```

**2. Supabase Connection Issues:**
```
Problem: "Invalid API key" errors
Solution: Verify environment variables are set correctly
Check: .env.local file and NEXT_PUBLIC_SUPABASE_* variables
```

**3. TypeScript Errors:**
```
Problem: "Property does not exist on type" errors
Solution: Check if types are imported and interfaces are up to date
Common fix: Restart TypeScript server in VS Code (Cmd+Shift+P → "TypeScript: Restart TS Server")
```

**4. Component Rendering Issues:**
```
Problem: Components not updating after state changes
Solution: Check if state updates are immutable and keys are unique
Debug: Use React DevTools to inspect state changes
```

### Feature Implementation Guides

#### Adding a New Feature (Example: Task Comments)
1. **Database Setup:**
   ```sql
   CREATE TABLE comments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     content TEXT NOT NULL,
     item_id UUID REFERENCES items(id) ON DELETE CASCADE,
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **API Routes:**
   ```tsx
   // src/app/api/items/[id]/comments/route.ts
   export async function GET(request: Request, { params }: { params: { id: string } }) {
     // Fetch comments for item
   }
   
   export async function POST(request: Request, { params }: { params: { id: string } }) {
     // Create new comment
   }
   ```

3. **Frontend Components:**
   ```tsx
   // src/components/comments/CommentsList.tsx
   // src/components/comments/CommentForm.tsx
   // src/components/comments/CommentItem.tsx
   ```

4. **State Management:**
   ```tsx
   // Add to existing store or create new one
   interface CommentsState {
     comments: Comment[]
     addComment: (comment: Comment) => void
     updateComment: (id: string, updates: Partial<Comment>) => void
   }
   ```

5. **Testing:**
   ```tsx
   // Write tests for components and API routes
   // Test both light and dark mode
   // Test error states and loading states
   ```

### Debugging Tips

#### Development Tools
```bash
# React DevTools - Component inspection
# Install browser extension for React DevTools

# Network debugging
# Use browser Network tab to inspect API calls

# State debugging
console.log('Current state:', state)
# Use React DevTools Profiler for performance issues

# TypeScript debugging
# Enable strict mode and fix all type errors
```

#### Common Debugging Patterns
```tsx
// Debug component renders
useEffect(() => {
  console.log('Component mounted/updated:', { props, state })
}, [props, state])

// Debug API calls
const debugApi = async (endpoint: string, options?: RequestInit) => {
  console.log('API call:', endpoint, options)
  const response = await fetch(endpoint, options)
  console.log('API response:', response.status, await response.clone().text())
  return response
}

// Debug Zustand store changes
const useStore = create((set, get) => ({
  // ... store definition
  debugAction: () => {
    console.log('Store state before:', get())
    // Perform action
    console.log('Store state after:', get())
  }
}))
```

---

## 📝 CLAUDE.md Maintenance Guidelines

### **Auto-Update Protocol**

This CLAUDE.md file should be **continuously updated** by Claude Code instances when:

#### ✅ **When to Update This File**

1. **New Patterns Discovered**: When implementing features and discovering better/more efficient patterns
2. **Common Issues Identified**: When fixing bugs that other developers might encounter
3. **Architecture Changes**: When making significant changes to the codebase structure
4. **New Dependencies Added**: When adding new libraries or tools to the project
5. **Performance Optimizations**: When implementing optimizations that should be standard
6. **Security Improvements**: When implementing security measures that should be documented
7. **Testing Enhancements**: When creating new testing patterns or utilities
8. **Deployment Insights**: When learning new deployment or environment configuration details

#### 📋 **Update Process**

1. **Identify Knowledge Gap**: While working, note when information in CLAUDE.md is missing or outdated
2. **Document Immediately**: Add the new information to the appropriate section
3. **Include Examples**: Always provide code examples for new patterns or solutions
4. **Test Documentation**: Ensure new documentation is accurate and helpful
5. **Commit with Context**: Include CLAUDE.md updates in relevant feature commits

#### 📚 **Update Templates**

**For New Patterns:**
```markdown
#### [Pattern Name] (Added: YYYY-MM-DD)
**Use Case**: When to use this pattern
**Problem Solved**: What issue this addresses

```tsx
// Code example with clear comments
function ExamplePattern() {
  // Implementation details
}
```

**Benefits**: Why this pattern is recommended
**Trade-offs**: Any limitations or considerations
```

**For Troubleshooting Issues:**
```markdown
**N. [Issue Title]:** (Added: YYYY-MM-DD)
```
Problem: Specific error or issue encountered
Root Cause: Why this happens
Solution: Step-by-step fix
Prevention: How to avoid in the future
Related: Links to similar issues or documentation
```

**For Architecture Updates:**
```markdown
### [Component/System Name] Update (YYYY-MM-DD)
**Change**: What was modified
**Reason**: Why the change was made
**Impact**: How this affects existing code
**Migration**: Steps to update existing implementations

```tsx
// Before
function OldPattern() {}

// After
function NewPattern() {}
```
```

#### 🎯 **Priority Areas for Updates**

**High Priority:**
- Security vulnerabilities and fixes
- Performance bottlenecks and solutions
- Breaking changes in dependencies
- New environment setup requirements

**Medium Priority:**
- New component patterns
- Improved testing strategies
- Enhanced debugging techniques
- Code style refinements

**Low Priority:**
- Minor optimizations
- Alternative implementation approaches
- Additional examples for existing patterns

#### 🔍 **Quality Standards for Updates**

1. **Accuracy**: All code examples must be tested and working
2. **Clarity**: Explanations should be clear and comprehensive
3. **Relevance**: Updates should solve real problems encountered
4. **Consistency**: Follow existing documentation style and format
5. **Completeness**: Include both the solution and the reasoning

#### 📊 **Tracking Updates**

When making significant updates to CLAUDE.md, consider adding a brief note in the commit message:
```
feat: implement smart folder drag and drop

- Add drag and drop functionality to smart folders
- Update CLAUDE.md with new DnD patterns and troubleshooting
- Add performance considerations for large lists
```

#### 🚀 **Contribution Guidelines**

**For Claude Code Instances:**
- **Be Proactive**: Don't wait for problems to occur, anticipate and document
- **Be Specific**: Include exact error messages, file paths, and solutions
- **Be Practical**: Focus on real-world scenarios and solutions
- **Be Comprehensive**: Cover both the technical implementation and the reasoning

**Review Checklist Before Updating:**
- [ ] Is this information missing or outdated in the current documentation?
- [ ] Will this help future Claude instances be more effective?
- [ ] Are the code examples tested and functional?
- [ ] Is the explanation clear and complete?
- [ ] Does this follow the established documentation patterns?

### 🎭 **Remember**: This CLAUDE.md is a **living document** - it should evolve with the codebase and become more valuable over time through continuous improvements and insights gained during development.

---

*Last Major Update: [Current Date] - Add date when making significant structural changes*
*Current Version: v1.0 - Increment when making breaking changes to documentation structure*