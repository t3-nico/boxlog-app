# Common Issues and Solutions

## 1. Theme/CSS Issues

### Problem: Dark mode colors not applying
**Solution**: Check if CSS variables are properly defined in both :root and .dark selectors
**Location**: `src/styles/theme-simplified.css`

**Fix**:
```css
:root {
  --bg-primary: 255 255 255;
  --text-primary: 17 24 39;
}

.dark {
  --bg-primary: 31 41 55;
  --text-primary: 249 250 251;
}
```

### Problem: Custom colors not switching in dark mode
**Solution**: Use CSS variables with `--tag-color` for custom colored elements
**Example**: `<div style={{'--tag-color': color}} className="tag-icon">Custom Color</div>`

## 2. Supabase Connection Issues

### Problem: "Invalid API key" errors
**Solution**: Verify environment variables are set correctly
**Check**: `.env.local` file and `NEXT_PUBLIC_SUPABASE_*` variables

**Required variables**:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Problem: Database connection fails in production
**Solution**: Check Supabase production database configuration and environment variables in Vercel dashboard

## 3. TypeScript Errors

### Problem: "Property does not exist on type" errors
**Solution**: Check if types are imported and interfaces are up to date
**Common fix**: Restart TypeScript server in VS Code (Cmd+Shift+P → "TypeScript: Restart TS Server")

### Problem: `any` type warnings
**Solution**: Replace `any` with proper TypeScript types
```tsx
// ❌ Bad
const data: any = await fetchData()

// ✅ Good
interface ApiResponse {
  id: string
  name: string
}
const data: ApiResponse = await fetchData()
```

## 4. Component Rendering Issues

### Problem: Components not updating after state changes
**Solution**: Check if state updates are immutable and keys are unique
**Debug**: Use React DevTools to inspect state changes

**Common fix**:
```tsx
// ❌ Bad - mutating state
setTags(tags.push(newTag))

// ✅ Good - immutable update
setTags([...tags, newTag])
```

### Problem: Infinite re-renders
**Solution**: Check useEffect dependencies and ensure callbacks are memoized
```tsx
// ❌ Bad
useEffect(() => {
  fetchData()
}, [fetchData]) // fetchData recreated on every render

// ✅ Good
const fetchData = useCallback(() => {
  // fetch logic
}, [dependency])

useEffect(() => {
  fetchData()
}, [fetchData])
```

## 5. shadcn/ui Migration Issues

### Problem: Button prop errors (plain, outline props not recognized)
**Root Cause**: shadcn/ui Button uses variant system instead of boolean props
**Solution**: Replace `plain={true}` with `variant="ghost"`, `outline={true}` with `variant="outline"`
**Prevention**: Always use shadcn/ui component patterns, check component documentation

### Problem: Dialog import errors (DialogBody, DialogActions not found)
**Root Cause**: shadcn/ui Dialog has different structure than Headless UI
**Solution**: Use DialogContent, DialogHeader, DialogFooter instead
**Example**: DialogBody → DialogContent, DialogActions → DialogFooter

### Problem: Select onChange not working
**Root Cause**: shadcn/ui Select uses onValueChange instead of onChange
**Solution**: Replace `onChange={setValue}` with `onValueChange={setValue}`
**Prevention**: Check shadcn/ui component API documentation

### Problem: AuthError type issues in form error states
**Root Cause**: Passing AuthError object to string state setter
**Solution**: Use error.message instead of error object
**Example**: `setError(error)` → `setError(error.message)`

## 6. Build and Deployment Issues

### Problem: Build fails with TypeScript errors
**Solution**: Run `npm run typecheck` to identify and fix type errors
**Prevention**: Set up pre-commit hooks to run type checking

### Problem: Environment variables not working in production
**Solution**: Check Vercel dashboard environment variables configuration
**Verify**: All required variables are set for the production environment

### Problem: API routes timing out
**Solution**: Ensure API routes complete within 10 seconds (Vercel limit)
**Check**: `vercel.json` function configuration

## 7. Performance Issues

### Problem: Slow page loads
**Solution**: Check bundle size and implement code splitting
**Tools**: Use `npm run build` to analyze bundle size

### Problem: Memory leaks
**Solution**: Ensure proper cleanup of event listeners and subscriptions
```tsx
useEffect(() => {
  const handler = () => {}
  window.addEventListener('resize', handler)
  
  return () => {
    window.removeEventListener('resize', handler)
  }
}, [])
```

### Problem: Unnecessary re-renders
**Solution**: Use React.memo, useMemo, and useCallback strategically
```tsx
const MemoizedComponent = React.memo(({ data }) => {
  const processedData = useMemo(() => {
    return processData(data)
  }, [data])
  
  return <div>{processedData}</div>
})
```

## 8. Authentication Issues

### Problem: User not staying logged in
**Solution**: Check Supabase session management and token refresh
**Verify**: AuthContext is properly wrapping the application

### Problem: Protected routes not working
**Solution**: Ensure authentication checks are in place
```tsx
// In layout or middleware
const { user, loading } = useAuth()

if (loading) return <LoadingSpinner />
if (!user) return <LoginPage />
```

## 9. Database Issues

### Problem: Data not updating in real-time
**Solution**: Check if subscriptions are properly set up
**Verify**: Database RLS policies allow the user to access data

### Problem: Query performance issues
**Solution**: Add appropriate indexes and optimize queries
**Check**: Database schema documentation for recommended indexes

## 10. Testing Issues

### Problem: Tests failing after component updates
**Solution**: Update test mocks and assertions to match new component behavior
**Check**: Test utilities and mock data are up to date

### Problem: Async tests timing out
**Solution**: Use proper async testing patterns with waitFor
```tsx
// ❌ Bad
await new Promise(resolve => setTimeout(resolve, 1000))

// ✅ Good
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

## Development Tools and Debugging

### React DevTools
- Install browser extension for React DevTools
- Use Profiler tab to identify performance issues
- Inspect component state and props

### Network Debugging
- Use browser Network tab to inspect API calls
- Check for failed requests and response times
- Verify correct headers and request payloads

### TypeScript Debugging
- Enable strict mode in tsconfig.json
- Use TypeScript compiler directly: `npx tsc --noEmit`
- Check for unused imports and variables

### Console Debugging
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
```

## Prevention Strategies

### 1. Code Quality
- Use ESLint and Prettier for consistent code formatting
- Enable TypeScript strict mode
- Write tests for critical functionality

### 2. Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor performance metrics
- Track user feedback and issues

### 3. Documentation
- Keep documentation up to date
- Document common patterns and solutions
- Create troubleshooting guides for complex issues

### 4. Testing
- Write comprehensive tests for critical paths
- Test in multiple browsers and devices
- Use automated testing in CI/CD pipeline