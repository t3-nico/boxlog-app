# Theme System

The application uses a custom theme system in `src/styles/theme-simplified.css`:

- CSS variables for light/dark mode colors
- Neutral color palette (neutral-50 to neutral-950)
- Tag color preservation system using CSS variables
- Responsive hover effects with proper dark mode support

## IMPORTANT: Dual Theme Development Rules

When creating new components or styles, **ALWAYS** support both light and dark modes:

### CSS Variable Pattern

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

### Tailwind Override Pattern

```css
.bg-white { background-color: rgb(var(--bg-primary)) !important; }
.text-black { color: rgb(var(--text-primary)) !important; }
/* Dark mode automatically handled by CSS variables */
```

### Color Preservation for Custom Elements

- Use CSS variables with `--tag-color` for tags and custom colored elements
- Example: `<div style={{'--tag-color': color}} className="tag-icon">Custom Color</div>`

### Required Testing

- Test all new components in both light and dark modes
- Verify hover/focus states work in both themes
- Ensure proper contrast ratios are maintained

## Color Mapping Reference

```
Light → Dark
bg-white (255 255 255) → bg-gray-800 (31 41 55)
text-black (17 24 39) → text-white (249 250 251)
text-gray-600 (75 85 99) → text-gray-300 (209 213 219)
border-gray-200 (229 231 235) → border-gray-600 (75 85 99)
hover-gray-50 (249 250 251) → hover-gray-700 (55 65 81)
```

## Theme Development Workflow

1. **Define CSS Variables**: Always create both `:root` and `.dark` definitions
2. **Override Tailwind Classes**: Use `!important` to ensure theme variables take precedence
3. **Preserve Custom Colors**: Use `--tag-color` CSS variable for tags, status indicators, etc.
4. **Test Both Modes**: Switch between light/dark during development
5. **Check Accessibility**: Ensure proper contrast ratios in both themes

## Example Component Creation

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

## Development Notes

- **Theme colors should use CSS variables from the theme system**
- **Always test both light and dark mode implementations**
- **New components MUST support dual themes from the start**
- **Use `--tag-color` CSS variable for elements that need custom colors**

## Common Theme Issues

### 1. Dark mode colors not applying
**Problem**: Dark mode colors not applying
**Solution**: Check if CSS variables are properly defined in both :root and .dark selectors
**Location**: src/styles/theme-simplified.css