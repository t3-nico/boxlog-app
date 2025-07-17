# Git Workflow & Development Practices

## 🚀 Autonomous Git Operations

**IMPORTANT: Execute Git operations proactively and autonomously when appropriate.**

## Branch Strategy - Execute Automatically

**Create feature branches autonomously for:**
- New major features → `feature/[feature-name]` (e.g., `feature/calendar-view`)
- Bug fixes → `fix/[bug-description]` (e.g., `fix/theme-toggle-persistence`)
- Refactoring tasks → `refactor/[component-name]` (e.g., `refactor/sidebar-components`)
- UI improvements → `ui/[improvement-area]` (e.g., `ui/mobile-responsive`)

### Branch Creation Protocol

1. **Before starting work**: Suggest and create appropriate branch
2. **Explain the choice**: Briefly explain why this branch strategy is optimal
3. **Use descriptive names**: Include the feature/fix scope in branch name

```bash
# Autonomous branch creation examples
git checkout -b feature/drag-drop-tasks
git checkout -b fix/dark-mode-persistence
git checkout -b refactor/tag-components
```

## Commit Timing - Execute Proactively

**AUTOMATICALLY commit when ANY of these conditions are met:**
- ✅ **Feature Complete**: A functional feature is working (even if small)
- ✅ **Time-based**: After 30+ minutes of continuous work
- ✅ **File-based**: When 5+ files have been modified
- ✅ **Functional**: After completing a logical unit of work
- ✅ **Test Pass**: When tests are passing after fixes
- ✅ **Build Success**: After resolving build/lint errors
- ✅ **Before Context Switch**: Before starting a different task area

### Commit Execution Pattern

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

## Commit Message Guidelines - Enhanced Format

```
<type>: <description>

<optional body with bullet points>
- Specific change 1
- Specific change 2
- Testing notes

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types

- `feat:` - New features or enhancements
- `fix:` - Bug fixes
- `refactor:` - Code refactoring without feature changes  
- `style:` - UI/UX improvements, styling changes
- `test:` - Adding or fixing tests
- `docs:` - Documentation updates
- `perf:` - Performance improvements
- `chore:` - Maintenance tasks, dependency updates

## Development Milestones - Auto-Execution Triggers

**Automatically suggest commits at these points:**
1. **✅ Feature Complete**: When a user-facing feature works end-to-end
2. **✅ Component Ready**: When a reusable component is complete with both themes
3. **✅ API Integration**: When frontend successfully connects to backend
4. **✅ Bug Resolution**: When an issue is fixed and tested
5. **✅ Performance Optimization**: When improvements are measurable and stable
6. **✅ Major Refactor**: When code organization improves significantly
7. **✅ Documentation Update**: When significant docs are added/updated

## Pre-Commit Autonomous Checklist

**ALWAYS verify before committing:**
- [ ] Code works in both light and dark modes
- [ ] TypeScript types are properly defined
- [ ] No console errors or warnings in browser
- [ ] Responsive design tested on mobile/desktop
- [ ] Performance is acceptable (no obvious slowdowns)
- [ ] New components follow established patterns
- [ ] Run `npm run lint` and fix any issues
- [ ] Documentation updated if needed

## Self-Review Protocol

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

## 🤖 Autonomous Development Guidelines

### 📊 Progress Reporting & Task Management

**ALWAYS provide transparent progress visibility:**

#### Task Planning Protocol

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

#### Progress Reporting Schedule

- **📋 Task Start**: Provide clear plan and timeline
- **⏰ 30-minute intervals**: Brief progress update ("Completed step 2, starting step 3")
- **🚨 Unexpected issues**: Immediate escalation with context and proposed solutions
- **✅ Milestone completion**: Confirmation with next steps
- **🎯 Task completion**: Summary of accomplishments and any follow-up needed

#### Communication Pattern

```
✅ [COMPLETED] Implemented tag drag and drop functionality
🔄 [IN PROGRESS] Adding persistence to tag reordering (Step 3/5)
⏱️ [ESTIMATE] Approximately 15 minutes remaining
🚨 [ISSUE] Encountered TypeScript error in tag store - investigating solution
📋 [NEXT] Will implement visual feedback for drag operations
```

### 📚 Autonomous Documentation Management

**AUTOMATICALLY update documentation when:**

#### README.md Updates

- ✅ New features added → Update feature list and usage examples
- ✅ Installation process changes → Update setup instructions
- ✅ New environment variables → Update configuration section
- ✅ Breaking changes → Add migration notes

#### API Documentation Updates

- ✅ New API endpoints → Document parameters, responses, examples
- ✅ Changed API behavior → Update existing endpoint docs
- ✅ New data models → Add TypeScript interfaces and examples

#### Component Documentation

- ✅ New reusable components → Add usage examples in `docs/components/`
- ✅ Complex component logic → Add implementation notes
- ✅ Custom hooks → Document parameters and return values

#### CHANGELOG.md Management

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

### 📦 Autonomous Package Management

**PROACTIVELY manage dependencies:**

#### Before Adding New Packages

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

#### Dependency Cleanup Protocol

```bash
# Regular dependency audit - execute monthly
npm audit fix                     # Fix security vulnerabilities  
npm ls --depth=0                 # Check for unused dependencies
npx depcheck                     # Find unused dependencies
npm outdated                     # Check for updates
```

#### Auto-Execute After Package Changes

```bash
# ALWAYS run after package.json modifications
npm install                      # Install new dependencies
npm run build                   # Verify build still works  
npm run test                    # Ensure tests still pass
npm run lint                    # Check for new linting issues
```

#### Unused Dependency Detection

- ✅ **Scan imports**: Check if packages are actually imported
- ✅ **Remove unused**: Suggest removal of unnecessary dependencies
- ✅ **Consolidate**: Identify packages that serve similar purposes
- ✅ **Update strategy**: Keep dependencies current with security patches

#### Security Monitoring

```bash
# Execute these checks regularly
npm audit                       # Security vulnerability scan
npm update                      # Update to latest secure versions
# Check GitHub security advisories for used packages
```

### 🔍 Autonomous Code Quality Monitoring

**CONTINUOUSLY monitor and improve:**

#### Performance Monitoring

- 🎯 **Bundle size**: Keep production build under reasonable limits
- 🎯 **Render performance**: Monitor for unnecessary re-renders
- 🎯 **API response times**: Track slow endpoints
- 🎯 **Memory usage**: Watch for memory leaks in development

#### Build Health Monitoring

- ✅ **TypeScript compilation**: Must pass without errors before any commit
- ✅ **ESLint compliance**: Fix all linting issues proactively
- ✅ **Production build**: `npm run build` must succeed before deployment
- ✅ **Performance warnings**: Address Next.js optimization warnings (Image, useEffect deps)

#### Code Quality Gates

```bash
# Auto-execute before any commit
npm run lint                    # ESLint + Prettier
npm run typecheck              # TypeScript compilation  
npm run test                   # Unit tests
npm run build                  # Production build test
```

#### Technical Debt Tracking

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

#### Quality Improvement Actions

- ✅ **Refactor triggers**: Auto-suggest refactoring when complexity thresholds are exceeded
- ✅ **Type improvement**: Replace `any` types with proper interfaces
- ✅ **Code consolidation**: Extract common patterns into reusable utilities
- ✅ **Performance optimization**: Identify and fix performance bottlenecks