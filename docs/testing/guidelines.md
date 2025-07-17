# Testing Guidelines

## Test Setup and Execution

### Running Tests

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

## Testing Patterns

### Component Testing with React Testing Library

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
```

### Custom Hook Testing

```tsx
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

## Testing Best Practices

### 1. Test Structure

- **Arrange**: Set up test data and mocks
- **Act**: Execute the function or interaction
- **Assert**: Verify the expected outcome

### 2. Testing Priorities

**High Priority:**
- Critical user flows (auth, data creation, etc.)
- Complex business logic
- Error handling and edge cases

**Medium Priority:**
- UI interactions and state changes
- API integration points
- Form validation logic

**Low Priority:**
- Simple utility functions
- Styling and layout (visual regression testing)
- Performance optimizations

### 3. Mock Strategy

```tsx
// Mock external dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/test'
  })
}))

// Mock API calls
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      insert: jest.fn().mockResolvedValue({ data: mockData, error: null })
    }))
  }
}))
```

### 4. Testing Async Operations

```tsx
// Testing async operations
it('should handle async data fetching', async () => {
  const mockData = [{ id: '1', name: 'Test' }]
  
  // Mock the API call
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockData)
  })
  
  render(<DataComponent />)
  
  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
  
  // Verify API was called
  expect(global.fetch).toHaveBeenCalledWith('/api/data')
})
```

### 5. Testing User Interactions

```tsx
// Testing user interactions
it('should toggle theme when button clicked', async () => {
  const user = userEvent.setup()
  render(<ThemeToggle />)
  
  const toggleButton = screen.getByRole('button', { name: /toggle theme/i })
  
  await user.click(toggleButton)
  
  expect(document.documentElement).toHaveClass('dark')
})
```

## Test Organization

### File Structure

```
src/
├── components/
│   ├── TagsList.tsx
│   └── __tests__/
│       └── TagsList.test.tsx
├── hooks/
│   ├── useApiData.ts
│   └── __tests__/
│       └── useApiData.test.ts
└── utils/
    ├── formatDate.ts
    └── __tests__/
        └── formatDate.test.ts
```

### Test Categories

1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: Component interactions and API calls
3. **End-to-End Tests**: Complete user workflows (using Cypress/Playwright)

## Common Testing Scenarios

### 1. Form Testing

```tsx
it('should validate form inputs', async () => {
  const user = userEvent.setup()
  render(<TagCreateForm onSubmit={jest.fn()} />)
  
  // Test empty form submission
  await user.click(screen.getByRole('button', { name: /save/i }))
  expect(screen.getByText('Name is required')).toBeInTheDocument()
  
  // Test valid form submission
  await user.type(screen.getByLabelText(/name/i), 'New Tag')
  await user.click(screen.getByRole('button', { name: /save/i }))
  
  expect(screen.queryByText('Name is required')).not.toBeInTheDocument()
})
```

### 2. Error Handling

```tsx
it('should display error message on API failure', async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))
  
  render(<DataComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
  })
})
```

### 3. Theme Testing

```tsx
it('should render correctly in both light and dark modes', () => {
  const { rerender } = render(<Component />)
  
  // Test light mode
  expect(screen.getByTestId('component')).toHaveClass('bg-white')
  
  // Switch to dark mode
  document.documentElement.classList.add('dark')
  rerender(<Component />)
  
  // Test dark mode
  expect(screen.getByTestId('component')).toHaveClass('bg-gray-800')
})
```

## Performance Testing

### 1. Component Performance

```tsx
it('should not re-render unnecessarily', () => {
  const renderSpy = jest.fn()
  
  function TestComponent({ data }) {
    renderSpy()
    return <div>{data.name}</div>
  }
  
  const { rerender } = render(<TestComponent data={{ name: 'Test' }} />)
  
  // Same props should not cause re-render
  rerender(<TestComponent data={{ name: 'Test' }} />)
  
  expect(renderSpy).toHaveBeenCalledTimes(1)
})
```

### 2. Memory Leak Testing

```tsx
it('should cleanup event listeners', () => {
  const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
  const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
  
  const { unmount } = render(<ComponentWithEventListener />)
  
  expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  
  unmount()
  
  expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
})
```

## Accessibility Testing

```tsx
it('should be accessible', async () => {
  const { container } = render(<AccessibleComponent />)
  
  // Check for accessibility violations
  const results = await axe(container)
  expect(results).toHaveNoViolations()
  
  // Test keyboard navigation
  const button = screen.getByRole('button')
  button.focus()
  expect(button).toHaveFocus()
})
```

## Test Utilities

### Custom Render Function

```tsx
// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'

const AllTheProviders = ({ children }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

### Mock Data Factory

```tsx
// test-factories.ts
export const createMockTag = (overrides = {}) => ({
  id: '1',
  name: 'Test Tag',
  color: '#3b82f6',
  icon: 'TagIcon',
  parentId: null,
  userId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})

export const createMockTask = (overrides = {}) => ({
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  status: 'pending',
  priority: 'medium',
  dueDate: null,
  completedAt: null,
  userId: 'user-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})
```