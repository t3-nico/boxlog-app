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
- **UI Components**: shadcn/ui (Radix UI primitives), legacy Headless UI (partial)
- **Authentication**: Supabase Auth with custom AuthContext
- **State Management**: Zustand with persistence
- **Database**: Supabase (PostgreSQL)
- **Drag & Drop**: @dnd-kit for sortable interfaces, kiboUI Kanban for board views
- **Icons**: Heroicons, Lucide React

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

### shadcn/ui Component Migration

The application has **COMPLETED** migration from legacy Headless UI components to shadcn/ui, achieving a modern, type-safe component system built on Radix UI primitives.

#### Migration Completion Status ✅ 100% Complete

**✅ Fully Migrated Components:**
- **Button** (shadcn/ui) - Complete replacement with variant system (`plain` → `variant="ghost"`, `outline` → `variant="outline"`)
- **Input** (shadcn/ui) - All form inputs migrated with proper validation
- **Dialog** (shadcn/ui) - DialogContent, DialogHeader, DialogFooter pattern (replaced DialogBody/DialogActions)
- **Select** (shadcn/ui) - SelectTrigger, SelectContent, SelectItem pattern (`onChange` → `onValueChange`)
- **Switch** (shadcn/ui) - Radix UI primitives with proper theming (`onChange` → `onCheckedChange`)
- **Badge** (shadcn/ui) - Consistent styling with variant support
- **DropdownMenu** (shadcn/ui) - Complete replacement with DropdownMenuTrigger/DropdownMenuContent pattern
- **Text** (removed) - Replaced with semantic HTML `<p>` tags with Tailwind classes

**✅ Authentication Components:**
- **LoginForm** (shadcn/ui) - Complete rewrite with proper AuthError handling
- **SignupForm** (shadcn/ui) - Complete rewrite with OAuth integration
- **PasswordResetForm** (shadcn/ui) - Complete rewrite with proper error states

**⚠️ Legacy Components (Minimal Remaining Usage):**
- **Dropdown** (Headless UI) - Used only in application-layout.tsx for stability
- **Checkbox** (Headless UI) - Used in specific refund forms
- **Fieldset/Field/Label** (Headless UI) - Coexists with shadcn/ui in forms

#### Component Usage Patterns

**shadcn/ui Dialog Pattern:**
```tsx
import { 
  Dialog, 
  DialogContent,
  DialogDescription, 
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog'

<Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    
    {/* Content */}
    
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button onClick={handleSave}>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**shadcn/ui Select Pattern:**
```tsx
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

**shadcn/ui Button Variants:**
```tsx
// Primary button (default)
<Button onClick={handleSave}>Save</Button>

// Secondary button
<Button variant="outline" onClick={onClose}>Cancel</Button>

// Ghost button (replaces legacy `plain` prop)
<Button variant="ghost" onClick={handleAction}>Action</Button>

// Other variants: destructive, secondary, link
<Button variant="destructive">Delete</Button>
```

**Switch Component Migration:**
```tsx
// Legacy Headless UI
<Switch checked={enabled} onChange={setEnabled} />

// shadcn/ui (note: onCheckedChange instead of onChange)
<Switch checked={enabled} onCheckedChange={setEnabled} />
```

**DropdownMenu Component Migration:**
```tsx
// Legacy Headless UI
<Dropdown>
  <DropdownButton>Actions</DropdownButton>
  <DropdownMenu>
    <DropdownItem onClick={handleEdit}>Edit</DropdownItem>
    <DropdownItem onClick={handleDelete}>Delete</DropdownItem>
  </DropdownMenu>
</Dropdown>

// shadcn/ui
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost">Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**AuthError Handling Pattern:**
```tsx
// ❌ Incorrect: Passing AuthError object to setError
const { error } = await signIn(email, password)
if (error) {
  setError(error) // This causes TypeScript errors
}

// ✅ Correct: Extract message from AuthError
const { error } = await signIn(email, password)
if (error) {
  setError(error.message) // Use error.message property
}
```

#### Mixed Component Strategy

The codebase uses a pragmatic mixed approach:
- **New features**: Use shadcn/ui components exclusively
- **Legacy compatibility**: Maintain Headless UI where breaking changes would be significant
- **Form components**: Gradual migration with Field/Label from Headless UI + shadcn/ui inputs

#### Migration Benefits Achieved

1. **Type Safety**: Better TypeScript integration with Radix UI primitives
2. **Accessibility**: Improved ARIA support and keyboard navigation
3. **Consistency**: Unified component API and styling patterns
4. **Performance**: Optimized bundle size with tree-shaking
5. **Developer Experience**: Better IntelliSense and prop validation
6. **Theme Integration**: Seamless integration with CSS variable theme system

#### Remaining Legacy Usage (Minimal)

**Files with Legacy Components:**
- `src/app/(app)/application-layout.tsx` - Dropdown components (kept for stability)
- `src/app/(app)/stats/[id]/refund.tsx` - Dialog, Checkbox components (specialized forms)
- `src/app/(app)/review/[id]/refund.tsx` - Dialog, Checkbox components (specialized forms)

**Migration Strategy Completed:**
- ✅ **Primary components migrated**: All commonly used UI components now use shadcn/ui
- ✅ **Build errors resolved**: All TypeScript compilation errors fixed
- ✅ **Performance optimized**: Reduced bundle size with tree-shaking
- ✅ **Type safety improved**: Better TypeScript integration with Radix UI primitives
- ✅ **Theme compatibility**: All components support light/dark mode switching

**Migration Lessons Learned:**
```tsx
// Common migration patterns that were applied:
const migrationPatterns = {
  button: "plain → variant='ghost', outline → variant='outline'",
  select: "onChange → onValueChange, restructure with SelectTrigger/SelectContent",
  dialog: "DialogBody/DialogActions → DialogContent/DialogHeader/DialogFooter",
  switch: "onChange → onCheckedChange",
  dropdown: "Dropdown/DropdownButton → DropdownMenu/DropdownMenuTrigger",
  authError: "error object → error.message for string state"
}
```

**Future Development Guidelines:**
- ✅ **Use shadcn/ui first**: All new components should use shadcn/ui
- ✅ **Mixed usage is stable**: Remaining legacy components are intentionally preserved
- ✅ **No breaking changes needed**: Current mixed approach works well in production

### kiboUI AI Components Integration

The application has **INTEGRATED** advanced AI interface components from kiboUI, providing state-of-the-art conversational UI patterns for the AI chatbot functionality.

#### AI Components Integrated ✅ 100% Complete

**✅ Core AI Components:**
- **AI Input** (kiboUI) - Advanced input with voice recognition, model selection, auto-resize
- **AI Conversation** (kiboUI) - Optimized chat display with auto-scroll and stick-to-bottom
- **AI Message** (kiboUI) - Unified message layout for user and assistant messages
- **AI Response** (kiboUI) - Advanced markdown rendering with syntax highlighting
- **AI Branch** (kiboUI) - Conversation branching for multiple response variants

**✅ Supporting Components:**
- **Code Block** (kiboUI) - Syntax highlighting with copy functionality and language selection
- **Scroll Area** (kiboUI) - Optimized scrolling components
- **Badge/Button/Select/Textarea** (kiboUI) - Additional UI components for AI interface
- **Kanban** (kiboUI) - Modern kanban board with drag-and-drop functionality
- **Table** (kiboUI) - Advanced table component with @tanstack/react-table and Jotai sorting

#### AI Component Usage Patterns

**AI Input Pattern:**
```tsx
import {
  AIInput,
  AIInputTextarea,
  AIInputToolbar,
  AIInputSubmit,
  AIInputButton,
  AIInputTools,
  AIInputModelSelect
} from '@/components/ui/kibo-ui/ai/input'

<AIInput onSubmit={handleSubmit}>
  <AIInputTextarea
    value={inputValue}
    onChange={setInputValue}
    placeholder="Ask Claude..."
    minHeight={40}
    maxHeight={120}
  />
  <AIInputToolbar>
    <AIInputTools>
      {/* Voice Input */}
      <AIInputButton onClick={toggleVoiceInput}>
        <Mic className="w-4 h-4" />
      </AIInputButton>
      
      {/* Model Selection */}
      <AIInputModelSelect value={model} onValueChange={setModel}>
        <AIInputModelSelectTrigger>
          <AIInputModelSelectValue />
        </AIInputModelSelectTrigger>
        <AIInputModelSelectContent>
          <AIInputModelSelectItem value="claude-3-sonnet">Claude 3 Sonnet</AIInputModelSelectItem>
        </AIInputModelSelectContent>
      </AIInputModelSelect>
    </AIInputTools>
    
    <AIInputSubmit disabled={!inputValue.trim()} status="ready" />
  </AIInputToolbar>
</AIInput>
```

**AI Conversation Pattern:**
```tsx
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton
} from '@/components/ui/kibo-ui/ai/conversation'

<AIConversation>
  <AIConversationContent>
    {messages.map(message => (
      <MessageComponent key={message.id} message={message} />
    ))}
  </AIConversationContent>
  <AIConversationScrollButton />
</AIConversation>
```

**AI Message Pattern:**
```tsx
import {
  AIMessage,
  AIMessageContent,
  AIMessageAvatar
} from '@/components/ui/kibo-ui/ai/message'
import { AIResponse } from '@/components/ui/kibo-ui/ai/response'

<AIMessage from="assistant">
  <AIMessageAvatar src="/claude-avatar.png" name="Claude" />
  <AIMessageContent>
    <AIResponse>
      {message.content}
    </AIResponse>
  </AIMessageContent>
</AIMessage>
```

**AI Branch Pattern (Conversation Variants):**
```tsx
import {
  AIBranch,
  AIBranchMessages,
  AIBranchSelector,
  AIBranchPrevious,
  AIBranchNext,
  AIBranchPage
} from '@/components/ui/kibo-ui/ai/branch'

<AIBranch onBranchChange={handleBranchChange}>
  <AIBranchMessages>
    {responseVariants.map((content, index) => (
      <AIResponse key={index}>{content}</AIResponse>
    ))}
  </AIBranchMessages>
  <AIBranchSelector from="assistant">
    <AIBranchPrevious />
    <AIBranchPage />
    <AIBranchNext />
  </AIBranchSelector>
</AIBranch>
```

**BoxLog Custom AI Response:**
```tsx
// Custom AI Response component optimized for BoxLog theme
const BoxLogAIResponse = ({ children, ...props }) => (
  <AIResponse
    className="prose prose-sm dark:prose-invert max-w-none
      [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
      [&_p]:leading-relaxed [&_p]:my-2
      [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800"
    options={{
      disallowedElements: ['script', 'iframe'],
      remarkPlugins: [],
    }}
    {...props}
  >
    {children}
  </AIResponse>
)
```

#### AI Integration Benefits Achieved

1. **Advanced UX**: Voice input, model selection, conversation branching
2. **Security**: XSS prevention with content sanitization 
3. **Performance**: Optimized scroll management with use-stick-to-bottom
4. **Accessibility**: ARIA support and keyboard navigation
5. **Developer Experience**: Type-safe components with TypeScript
6. **Theme Integration**: Seamless light/dark mode support
7. **Markdown Support**: Rich content rendering with syntax highlighting

#### AI Feature Implementation

**Voice Input Integration:**
- Web Speech API with Japanese language support
- Visual feedback during recording (red indicator)
- Automatic transcription to text input
- Fallback for unsupported browsers

**Model Selection Features:**
- Claude 3 Sonnet (default, balanced)
- Claude 3 Haiku (fast response)
- Claude 3 Opus (high performance)
- Dropdown interface with easy switching

**Conversation Branching:**
- Multiple AI response variants (string | string[])
- Navigation controls (previous/next/page indicator)
- Automatic branch detection and UI switching
- Personalization and preference tracking

**Security & Performance:**
- Content sanitization (script/iframe blocking)
- Memory optimization with React.memo
- Efficient re-rendering with proper dependencies
- Auto-scroll management without manual refs

#### AI Components File Structure

```
src/components/ui/kibo-ui/ai/
├── input.tsx           # Advanced input with voice & model selection
├── conversation.tsx    # Auto-scroll conversation container
├── message.tsx        # Unified message layout
├── response.tsx       # Markdown rendering with security
├── branch.tsx         # Conversation branching system
├── source.tsx         # Source attribution
├── suggestion.tsx     # Response suggestions
├── tool.tsx          # Tool integration
└── reasoning.tsx      # AI reasoning display
```

**Integration Status:**
- ✅ **AI Input**: Voice input, model selection, auto-resize implemented
- ✅ **AI Conversation**: Auto-scroll, scroll-to-bottom implemented  
- ✅ **AI Message**: Unified layout with avatars implemented
- ✅ **AI Response**: Markdown, code highlighting, security implemented
- ✅ **AI Branch**: Multi-variant responses, navigation implemented
- 🔄 **Advanced Features**: Source, suggestion, tool components available for future use

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

#### **🚀 Autonomous Git Operations**

**IMPORTANT: Execute Git operations proactively and autonomously when appropriate.**

#### Branch Strategy - Execute Automatically
**Create feature branches autonomously for:**
- New major features → `feature/[feature-name]` (e.g., `feature/calendar-view`)
- Bug fixes → `fix/[bug-description]` (e.g., `fix/theme-toggle-persistence`)
- Refactoring tasks → `refactor/[component-name]` (e.g., `refactor/sidebar-components`)
- UI improvements → `ui/[improvement-area]` (e.g., `ui/mobile-responsive`)

**Branch Creation Protocol:**
1. **Before starting work**: Suggest and create appropriate branch
2. **Explain the choice**: Briefly explain why this branch strategy is optimal
3. **Use descriptive names**: Include the feature/fix scope in branch name

```bash
# Autonomous branch creation examples
git checkout -b feature/drag-drop-tasks
git checkout -b fix/dark-mode-persistence
git checkout -b refactor/tag-components
```

#### Commit Timing - Execute Proactively
**AUTOMATICALLY commit when ANY of these conditions are met:**
- ✅ **Feature Complete**: A functional feature is working (even if small)
- ✅ **Time-based**: After 30+ minutes of continuous work
- ✅ **File-based**: When 5+ files have been modified
- ✅ **Functional**: After completing a logical unit of work
- ✅ **Test Pass**: When tests are passing after fixes
- ✅ **Build Success**: After resolving build/lint errors
- ✅ **Before Context Switch**: Before starting a different task area

**Commit Execution Pattern:**
```bash
# Standard commit sequence
git add .
git commit -m "feat: implement tag drag and drop functionality

- Add sortable tag list with @dnd-kit
- Implement tag reordering in sidebar
- Update tag store with new order persistence
- Test both light and dark mode compatibility

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### Commit Message Guidelines - Enhanced Format
```
<type>: <description>

<optional body with bullet points>
- Specific change 1
- Specific change 2
- Testing notes

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Commit Types:**
- `feat:` - New features or enhancements
- `fix:` - Bug fixes
- `refactor:` - Code refactoring without feature changes  
- `style:` - UI/UX improvements, styling changes
- `test:` - Adding or fixing tests
- `docs:` - Documentation updates
- `perf:` - Performance improvements
- `chore:` - Maintenance tasks, dependency updates

#### Development Milestones - Auto-Execution Triggers
**Automatically suggest commits at these points:**
1. **✅ Feature Complete**: When a user-facing feature works end-to-end
2. **✅ Component Ready**: When a reusable component is complete with both themes
3. **✅ API Integration**: When frontend successfully connects to backend
4. **✅ Bug Resolution**: When an issue is fixed and tested
5. **✅ Performance Optimization**: When improvements are measurable and stable
6. **✅ Major Refactor**: When code organization improves significantly
7. **✅ Documentation Update**: When significant docs are added/updated

#### Pre-Commit Autonomous Checklist
**ALWAYS verify before committing:**
- [ ] Code works in both light and dark modes
- [ ] TypeScript types are properly defined
- [ ] No console errors or warnings in browser
- [ ] Responsive design tested on mobile/desktop
- [ ] Performance is acceptable (no obvious slowdowns)
- [ ] New components follow established patterns
- [ ] Run `npm run lint` and fix any issues
- [ ] Documentation updated if needed

#### Self-Review Protocol
**Execute this self-review before each commit:**
```tsx
// Self-review checklist - execute mentally for each commit
const selfReview = {
  edgeCases: "Are edge cases handled (empty states, errors, loading)?",
  performance: "Any performance issues (unnecessary re-renders, large loops)?", 
  consistency: "Does this follow existing code patterns and conventions?",
  security: "Are there any security concerns (XSS, data exposure)?",
  accessibility: "Is this accessible (keyboard nav, screen readers)?",
  responsive: "Does this work on all screen sizes?",
  themes: "Tested in both light and dark mode?"
}
```

### **🤖 Autonomous Development Guidelines**

#### **📊 Progress Reporting & Task Management**

**ALWAYS provide transparent progress visibility:**

**Task Planning Protocol:**
```tsx
// At the start of any significant task
const taskPlan = {
  objective: "What we're trying to achieve",
  approach: "High-level strategy and method",
  steps: [
    "1. Research and analysis phase",
    "2. Design and architecture planning", 
    "3. Implementation phase",
    "4. Testing and validation",
    "5. Documentation and cleanup"
  ],
  estimatedTime: "Realistic time estimate",
  riskFactors: ["Potential blockers or challenges"]
}
```

**Progress Reporting Schedule:**
- **📋 Task Start**: Provide clear plan and timeline
- **⏰ 30-minute intervals**: Brief progress update ("Completed step 2, starting step 3")
- **🚨 Unexpected issues**: Immediate escalation with context and proposed solutions
- **✅ Milestone completion**: Confirmation with next steps
- **🎯 Task completion**: Summary of accomplishments and any follow-up needed

**Communication Pattern:**
```
✅ [COMPLETED] Implemented tag drag and drop functionality
🔄 [IN PROGRESS] Adding persistence to tag reordering (Step 3/5)
⏱️ [ESTIMATE] Approximately 15 minutes remaining
🚨 [ISSUE] Encountered TypeScript error in tag store - investigating solution
📋 [NEXT] Will implement visual feedback for drag operations
```

#### **📚 Autonomous Documentation Management**

**AUTOMATICALLY update documentation when:**

**README.md Updates:**
- ✅ New features added → Update feature list and usage examples
- ✅ Installation process changes → Update setup instructions
- ✅ New environment variables → Update configuration section
- ✅ Breaking changes → Add migration notes

**API Documentation Updates:**
- ✅ New API endpoints → Document parameters, responses, examples
- ✅ Changed API behavior → Update existing endpoint docs
- ✅ New data models → Add TypeScript interfaces and examples

**Component Documentation:**
- ✅ New reusable components → Add usage examples in `docs/components/`
- ✅ Complex component logic → Add implementation notes
- ✅ Custom hooks → Document parameters and return values

**CHANGELOG.md Management:**
```markdown
# CHANGELOG.md - Auto-update pattern

## [Unreleased]
### Added
- New tag system with hierarchical organization
- Drag and drop functionality for tag reordering

### Changed  
- Improved theme system with better dark mode support

### Fixed
- Resolved tag color persistence in dark mode

### Breaking Changes
- Updated tag API structure (see migration guide)
```

#### **📦 Autonomous Package Management**

**PROACTIVELY manage dependencies:**

**Before Adding New Packages:**
1. **Justify necessity**: Explain why existing solutions don't work
2. **Research alternatives**: Compare 2-3 similar packages
3. **Check bundle impact**: Estimate size increase
4. **Verify maintenance**: Check last update, GitHub stars, issues

```tsx
// Package addition protocol
const packageEvaluation = {
  need: "Why we need this package",
  alternatives: ["pkg-1", "pkg-2", "pkg-3"],
  chosen: "selected-package",
  reasoning: "Why this specific package",
  bundleSize: "Estimated impact on bundle",
  maintenance: "Activity level and community support"
}
```

**Dependency Cleanup Protocol:**
```bash
# Regular dependency audit - execute monthly
npm audit fix                     # Fix security vulnerabilities  
npm ls --depth=0                 # Check for unused dependencies
npx depcheck                     # Find unused dependencies
npm outdated                     # Check for updates
```

**Auto-Execute After Package Changes:**
```bash
# ALWAYS run after package.json modifications
npm install                      # Install new dependencies
npm run build                   # Verify build still works  
npm run test                    # Ensure tests still pass
npm run lint                    # Check for new linting issues
```

**Unused Dependency Detection:**
- ✅ **Scan imports**: Check if packages are actually imported
- ✅ **Remove unused**: Suggest removal of unnecessary dependencies
- ✅ **Consolidate**: Identify packages that serve similar purposes
- ✅ **Update strategy**: Keep dependencies current with security patches

**Security Monitoring:**
```bash
# Execute these checks regularly
npm audit                       # Security vulnerability scan
npm update                      # Update to latest secure versions
# Check GitHub security advisories for used packages
```

#### **🔍 Autonomous Code Quality Monitoring**

**CONTINUOUSLY monitor and improve:**

**Performance Monitoring:**
- 🎯 **Bundle size**: Keep production build under reasonable limits
- 🎯 **Render performance**: Monitor for unnecessary re-renders
- 🎯 **API response times**: Track slow endpoints
- 🎯 **Memory usage**: Watch for memory leaks in development

**Build Health Monitoring:**
- ✅ **TypeScript compilation**: Must pass without errors before any commit
- ✅ **ESLint compliance**: Fix all linting issues proactively
- ✅ **Production build**: `npm run build` must succeed before deployment
- ✅ **Performance warnings**: Address Next.js optimization warnings (Image, useEffect deps)

**Code Quality Gates:**
```bash
# Auto-execute before any commit
npm run lint                    # ESLint + Prettier
npm run typecheck              # TypeScript compilation  
npm run test                   # Unit tests
npm run build                  # Production build test
```

**Technical Debt Tracking:**
```tsx
// Auto-scan for technical debt indicators
const debtIndicators = {
  todoComments: "Scan for TODO/FIXME comments",
  duplicatedCode: "Identify repeated logic patterns", 
  largeFunctions: "Flag functions >50 lines",
  anyTypes: "Find TypeScript 'any' usage",
  unusedCode: "Detect dead code",
  outdatedPatterns: "Identify deprecated patterns"
}
```

**Quality Improvement Actions:**
- ✅ **Refactor triggers**: Auto-suggest refactoring when complexity thresholds are exceeded
- ✅ **Type improvement**: Replace `any` types with proper interfaces
- ✅ **Code consolidation**: Extract common patterns into reusable utilities
- ✅ **Performance optimization**: Identify and fix performance bottlenecks

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

### Deployment & Production

#### Vercel Deployment Configuration

This application is **designed for Vercel deployment** and follows Vercel best practices:

**Key Vercel Compatibility Features:**
- Next.js 14 App Router (fully compatible with Vercel)
- Server-side rendering with Supabase SSR
- API routes for backend functionality
- Static asset optimization
- Environment variable management
- Zero-config deployment

**Vercel Deployment Steps:**
```bash
# 1. Install Vercel CLI (if not already installed)
npm i -g vercel

# 2. Deploy from project root
vercel

# 3. Set up environment variables via Vercel dashboard or CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 4. Redeploy with environment variables
vercel --prod
```

**Vercel Project Configuration (vercel.json):**
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_APP_URL": {
      "value": "https://your-app.vercel.app"
    }
  },
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

**Production Checklist for Vercel:**
- [ ] All environment variables configured in Vercel dashboard
- [ ] Build command succeeds (`npm run build`)
- [ ] No build warnings or errors
- [ ] Supabase production database configured
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate is active
- [ ] Performance optimizations applied

### Environment Variables

#### Required Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # Server-side only

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000 # or production URL (https://your-app.vercel.app)
NODE_ENV=development # development, production, test

# Optional: Analytics & Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
SENTRY_DSN=your_sentry_dsn # Error tracking

# Optional: Feature Flags
NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES=false
```

#### Environment Setup

**Development Environment:**
```bash
# Development setup
cp .env.example .env.local
# Edit .env.local with your values

# Verify environment variables are loaded
npm run dev
```

**Production Environment (Vercel):**
```bash
# Method 1: Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_APP_URL production

# Method 2: Vercel Dashboard
# 1. Go to your project dashboard on vercel.com
# 2. Navigate to Settings > Environment Variables
# 3. Add each environment variable for Production environment
# 4. Redeploy to apply changes
```

**Environment Variable Validation:**
```tsx
// Add to src/lib/env.ts for runtime validation
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
}

// Validate required environment variables at build time
Object.entries(env).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})
```

### Code Style Guidelines

#### Naming Conventions

**📋 Complete naming conventions documented in:** `/docs/NAMING_CONVENTIONS.md`

**Key Rules Summary:**
```tsx
// ✅ Components: PascalCase
export function TagEditDialog() {}
export function SmartFolderList() {}

// ✅ Variables and functions: camelCase
const tagCount = 5
const handleTagUpdate = () => {}

// ✅ Constants: SCREAMING_SNAKE_CASE (primitives) / camelCase (objects)
const MAX_TAG_DEPTH = 3
const apiEndpoints = { TAGS: '/api/tags' }

// ✅ Types and interfaces: PascalCase
interface TagEditDialogProps {
  tag: Tag
  onSave: (tag: Tag) => void
}

// ✅ File names: kebab-case (consistent)
tag-edit-dialog.tsx
use-tags.ts
sidebar-config.ts
```

**🏗️ Component Integration Strategy:**
```
src/components/ui/
├── button.tsx              # shadcn/ui components
├── dialog.tsx              # shadcn/ui components  
└── kibo-ui/                # kiboUI components (separated)
    ├── color-picker/
    ├── gantt/
    └── ai-input/
```

**📦 Import Strategy:**
```tsx
// shadcn/ui (primary choice)
import { Button } from '@/components/ui/button'

// kiboUI (advanced components)
import { ColorPicker } from '@/components/ui/kibo-ui/color-picker'

// Conflict resolution (when needed)
import { Button as UIButton } from '@/components/ui/button'
import { Button as KiboButton } from '@/components/ui/kibo-ui/button'
```

**🎯 Component Selection Priority:**
1. **shadcn/ui** - For basic UI components (Button, Dialog, Select, etc.)
2. **kiboUI** - For advanced components (Gantt, ColorPicker, AI components, Kanban)
3. **Custom** - Only when neither provides the needed functionality

**⚠️ kiboUI Integration Rules:**
- Install individually: `npx kibo-ui add [component]`
- Keep in separate `/kibo-ui/` directory to avoid conflicts
- Follow same Props naming pattern: `ComponentNameProps`
- Use consistent export pattern: named exports
- Maintain shadcn/ui styling compatibility

**🚀 段階的導入戦略:**
```
フェーズ1: 基本UI構築 (shadcn/ui完全活用)
├── Button, Dialog, Select等の基本UI完成
└── 既存コンポーネントの最適化

フェーズ2: 特定機能のみKibo UI追加
├── Gantt → プロジェクト管理画面のみ
├── AI Input → チャット機能のみ
└── 動作確認・テスト

フェーズ3: 動作確認後の拡張
├── Color Picker → 必要に応じて
├── Dropzone → 必要に応じて
└── その他コンポーネント
```

## コンポーネント使用ルール
- **基本UI**: shadcn/ui を使用
- **AI機能**: kiboUI AI コンポーネント を使用 ✅ **統合完了**
- **高度な機能**: kiboUI を使用

### AI機能 (kiboUI) - ✅ 統合済み
- **AI Input**: `@/components/ui/kibo-ui/ai/input` - 音声入力・モデル選択・自動リサイズ
- **AI Conversation**: `@/components/ui/kibo-ui/ai/conversation` - 自動スクロール・最適化されたチャット表示
- **AI Message**: `@/components/ui/kibo-ui/ai/message` - 統一メッセージレイアウト・アバター表示
- **AI Response**: `@/components/ui/kibo-ui/ai/response` - マークダウン・コードハイライト・セキュリティ
- **AI Branch**: `@/components/ui/kibo-ui/ai/branch` - 会話分岐・複数レスポンス対応

### タスク管理機能 (kiboUI) - ✅ 統合済み
- **Kanban**: `@/components/ui/kibo-ui/kanban` - ドラッグ&ドロップ・アクセシビリティ対応・テーマ統合
- **Table**: `@/components/ui/kibo-ui/table` - @tanstack/react-table統合・Jotaiソート・フィルタリング対応

#### Kanban Component Usage Pattern

**Kanban Board Pattern:**
```tsx
import { 
  KanbanProvider, 
  KanbanBoard, 
  KanbanHeader, 
  KanbanCards, 
  KanbanCard 
} from '@/components/ui/kibo-ui/kanban'

// Column and data definitions
const columns = [
  { id: 'todo', name: 'Todo', color: 'bg-gray-50' },
  { id: 'in_progress', name: 'In Progress', color: 'bg-blue-50' },
  { id: 'done', name: 'Done', color: 'bg-green-50' }
]

const data = [
  { id: '1', name: 'Task 1', column: 'todo', task: taskObject },
  { id: '2', name: 'Task 2', column: 'in_progress', task: taskObject }
]

<KanbanProvider 
  columns={columns} 
  data={data}
  onDataChange={handleDataChange}
>
  {(column) => (
    <KanbanBoard key={column.id} id={column.id}>
      <KanbanHeader>
        <span>{column.name}</span>
        <Badge>{getColumnTaskCount(column.id)}</Badge>
      </KanbanHeader>
      
      <KanbanCards id={column.id}>
        {(item) => (
          <KanbanCard key={item.id} id={item.id} name={item.name}>
            {/* Custom card content */}
          </KanbanCard>
        )}
      </KanbanCards>
    </KanbanBoard>
  )}
</KanbanProvider>
```

**Kanban Features:**
- ✅ **Drag & Drop**: Built-in @dnd-kit integration with accessibility
- ✅ **Type Safety**: Full TypeScript support with generic types
- ✅ **Theme Integration**: Supports light/dark mode via CSS variables
- ✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support

#### Table Component Usage Pattern

**Table Component Pattern:**
```tsx
import {
  TableProvider,
  TableHeader,
  TableHeaderGroup,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableColumnHeader,
  type ColumnDef,
} from '@/components/ui/kibo-ui/table'

// Column definitions with sorting
const columns: ColumnDef<Task>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <TableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">
        {row.getValue('title')}
      </div>
    ),
  },
  // More columns...
]

// Table implementation
<TableProvider columns={columns} data={tasks}>
  <TableHeader>
    {({ headerGroup }) => (
      <TableHeaderGroup headerGroup={headerGroup}>
        {({ header }) => (
          <TableHead key={header.id} header={header} />
        )}
      </TableHeaderGroup>
    )}
  </TableHeader>
  <TableBody>
    {({ row }) => (
      <TableRow key={row.id} row={row}>
        {({ cell }) => (
          <TableCell key={cell.id} cell={cell} />
        )}
      </TableRow>
    )}
  </TableBody>
</TableProvider>
```

**Table Features:**
- ✅ **Sorting**: Integrated @tanstack/react-table with Jotai state management
- ✅ **Filtering**: Built-in filtering capabilities
- ✅ **Selection**: Row selection with checkbox controls
- ✅ **Mobile Responsive**: Automatically switches to mobile cards on small screens
- ✅ **Inline Editing**: Dropdown editing for status and priority fields
- ✅ **Theme Integration**: Supports light/dark mode via CSS variables
- ✅ **Customization**: Flexible card content and column styling
- ✅ **Performance**: Optimized rendering with React.memo and virtual scrolling
- ✅ **BoxLog Integration**: Seamless integration with task management features

### 高度な機能 (kiboUI) - 🔄 必要に応じて追加
- **ガントチャート**: `@/components/ui/kibo-ui/gantt` (プロジェクト管理画面)
- **カラーピッカー**: `@/components/ui/kibo-ui/color-picker` (設定画面)
- **ドロップゾーン**: `@/components/ui/kibo-ui/dropzone` (ファイルアップロード)

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

**5. shadcn/ui Migration Issues:** (Added: 2024-07-16)
```
Problem: Button prop errors (plain, outline props not recognized)
Root Cause: shadcn/ui Button uses variant system instead of boolean props
Solution: Replace plain={true} with variant="ghost", outline={true} with variant="outline"
Prevention: Always use shadcn/ui component patterns, check component documentation

Problem: Dialog import errors (DialogBody, DialogActions not found)
Root Cause: shadcn/ui Dialog has different structure than Headless UI
Solution: Use DialogContent, DialogHeader, DialogFooter instead
Example: DialogBody → DialogContent, DialogActions → DialogFooter

Problem: Select onChange not working
Root Cause: shadcn/ui Select uses onValueChange instead of onChange
Solution: Replace onChange={setValue} with onValueChange={setValue}
Prevention: Check shadcn/ui component API documentation

Problem: AuthError type issues in form error states  
Root Cause: Passing AuthError object to string state setter
Solution: Use error.message instead of error object
Example: setError(error) → setError(error.message)
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

*Last Major Update: 2025-01-16 - Added kiboUI Table integration*
*Current Version: v1.5 - Enhanced with kiboUI Table for advanced task management with sorting, filtering, and inline editing capabilities*