# Complete Tailwind CSS Conversion Guide

**Last Updated**: 2025-10-01
**Status**: 7/27 files converted (26% complete)

## ✅ Completed Files (7)

### Event Creation Components
1. ✅ **TagInput.tsx** - Fully converted to Tailwind CSS
2. ✅ **TitleInput.tsx** - Fully converted to Tailwind CSS

### Event Common Components
3. ✅ **EventStatusChip.tsx** - Converted with inline color styles
4. ✅ **EventTypeBadge.tsx** - Converted with inline color styles

### Event Edit Components
5. ✅ **EditHeader.tsx** - Converted with conditional styling using `cn()`

### Inspector Components (Already Converted)
6. ✅ **EventDetailHeader.tsx** - Already using Tailwind
7. ✅ **eventTimelineHelpers.tsx** - Already using Tailwind

## 📋 Remaining Files (20)

### High Priority - Event Components (10 files)
```
src/features/events/components/create/CreateEventForm.tsx
src/features/events/components/create/CreateEventTrigger.tsx
src/features/events/components/create/DateSelector.tsx
src/features/events/components/create/EssentialCreate.tsx
src/features/events/components/edit/components/EditFooter.tsx
src/features/events/components/edit/components/EditSuccessAnimation.tsx
src/features/events/components/edit/components/EditOptions.tsx
src/features/events/components/edit/EssentialEditView.tsx
```

### Medium Priority - Calendar Components (10 files)
```
src/features/calendar/components/layout/Header/ViewSwitcher.tsx
src/features/calendar/components/layout/Header/DateRangeDisplay.tsx
src/features/calendar/components/layout/Header/DateNavigator.tsx
src/features/calendar/components/common/MiniCalendarPopover.tsx
src/features/calendar/components/common/MiniCalendar.tsx
src/features/calendar/components/dialogs/WeekendDropConfirmDialog.tsx
src/features/calendar/components/views/shared/DateDisplay/DateDisplay.tsx
src/features/calendar/components/views/shared/DateDisplay/DayDisplay.tsx
src/features/calendar/components/views/shared/constants/grid.constants.ts
src/features/calendar/theme/styles.ts
```

## 🎯 Complete Conversion Reference

### Step 1: Update Imports

**Remove these imports:**
```tsx
import { border, colors, semantic, text } from '@/config/theme/colors'
import { rounded } from '@/config/theme/rounded'
import { body, heading } from '@/config/theme/typography'
import { icon } from '@/config/theme/icons'
import { elevation } from '@/config/theme/elevation'
import { primary, secondary } from '@/config/theme/colors'
```

**Add this import:**
```tsx
import { cn } from '@/lib/utils'
```

### Step 2: Theme → Tailwind Mapping

#### Text Colors
```tsx
// OLD → NEW
${text.primary} → text-neutral-900 dark:text-neutral-50
${text.secondary} → text-neutral-600 dark:text-neutral-400
${text.muted} → text-neutral-600 dark:text-neutral-400
```

#### Background Colors
```tsx
// OLD → NEW
${colors.background.base} → bg-white dark:bg-neutral-900
${colors.background.surface} → bg-neutral-50 dark:bg-neutral-900
${colors.background.elevated} → bg-neutral-100 dark:bg-neutral-800
${colors.background.accent} → bg-blue-50 dark:bg-blue-900/20
```

#### Borders
```tsx
// OLD → NEW
${border.universal} → border border-neutral-300 dark:border-neutral-700
border-neutral-200 dark:border-neutral-800 → lighter border
```

#### Semantic Colors

**Success (Green)**
```tsx
// OLD → NEW
${semantic.success.DEFAULT} → #10b981 (inline style or text-green-600 dark:text-green-400)
${semantic.success.text} → text-green-600 dark:text-green-400
${semantic.success.bg} → bg-green-50 dark:bg-green-900/20
${semantic.success.background} → bg-green-50 dark:bg-green-900/20
```

**Error (Red)**
```tsx
// OLD → NEW
${semantic.error.DEFAULT} → #ef4444
${semantic.error.text} → text-red-600 dark:text-red-400
${semantic.error.bg} → bg-red-50 dark:bg-red-900/20
${semantic.error.background} → bg-red-50 dark:bg-red-900/20
${semantic.error.surface} → bg-red-50 dark:bg-red-900/20
```

**Warning (Amber)**
```tsx
// OLD → NEW
${semantic.warning.DEFAULT} → #f59e0b
${semantic.warning.text} → text-amber-600 dark:text-amber-400
${semantic.warning.bg} → bg-amber-50 dark:bg-amber-900/20
```

**Info (Blue)**
```tsx
// OLD → NEW
${semantic.info.DEFAULT} → #3b82f6
${semantic.info.text} → text-blue-600 dark:text-blue-400
${semantic.info.bg} → bg-blue-50 dark:bg-blue-900/20
```

#### Primary/Secondary Buttons
```tsx
// OLD → NEW
${primary.DEFAULT} → bg-blue-500 text-white
${primary.hover} → hover:bg-blue-600
${primary.active} → active:bg-blue-700
${primary.text} → text-white

${secondary.DEFAULT} → bg-neutral-200 dark:bg-neutral-700
${secondary.hover} → hover:bg-neutral-300 dark:hover:bg-neutral-600
```

#### Typography
```tsx
// OLD → NEW
${heading.h1} → text-4xl font-bold
${heading.h2} → text-2xl font-semibold
${heading.h3} → text-xl font-semibold
${heading.h4} → text-lg font-semibold
${heading.h5} → text-base font-semibold
${heading.h6} → text-sm font-semibold

${body.large} → text-lg
${body.DEFAULT} → text-base
${body.medium} → text-sm
${body.small} → text-sm
${body.xs} → text-xs
```

#### Border Radius
```tsx
// OLD → NEW
${rounded.component.button.sm} → rounded
${rounded.component.button.md} → rounded-md
${rounded.component.button.lg} → rounded-lg
${rounded.component.input.md} → rounded-md
${rounded.modal} → rounded-2xl
${rounded.radius.full} → rounded-full
```

#### Icons
```tsx
// OLD → NEW
${icon.size.xs} → h-3 w-3
${icon.size.sm} → h-4 w-4
${icon.size.md} → h-5 w-5
${icon.size.lg} → h-6 w-6
${icon.size.xl} → h-8 w-8
```

#### Shadows/Elevation
```tsx
// OLD → NEW
${elevation.sm} → shadow-sm
${elevation.md} → shadow-md
${elevation.lg} → shadow-lg
${elevation.xl} → shadow-xl
shadow-2xl → unchanged
```

### Step 3: Complex Conversions

#### Using cn() for Conditional Classes
```tsx
// OLD
className={`${body.small} ${text.muted} ${someCondition ? semantic.success.text : ''}`}

// NEW
className={cn(
  "text-sm text-neutral-600 dark:text-neutral-400",
  someCondition && "text-green-600 dark:text-green-400"
)}
```

#### Template Literals with Dynamic Values
```tsx
// OLD
className={`w-full py-3 ${colors.background.surface} ${border.universal}`}

// NEW
className="w-full py-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
```

#### Button States
```tsx
// OLD
className={`
  ${primary.DEFAULT} ${primary.hover} ${primary.active}
  transition-all duration-200
`}

// NEW
className="bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 transition-all duration-200"
```

#### Dynamic Colors (Keep as inline styles)
```tsx
// For tag colors, event colors, etc. - keep inline styles
style={{
  backgroundColor: tag.color,
  borderColor: tag.color,
  color: tag.color
}}
```

### Step 4: Testing Checklist

After converting each file:

1. ✅ No `@/config/theme/*` imports remain
2. ✅ `cn` utility imported if using conditional classes
3. ✅ All text colors have dark mode variants
4. ✅ All background colors have dark mode variants
5. ✅ Borders have dark mode variants
6. ✅ Dynamic colors preserved as inline styles
7. ✅ Component renders without errors
8. ✅ Visual appearance matches original

## 📝 Conversion Template

```tsx
// BEFORE
'use client'

import { text, colors, semantic } from '@/config/theme/colors'
import { body, heading } from '@/config/theme/typography'
import { rounded } from '@/config/theme/rounded'

export const MyComponent = () => {
  return (
    <div className={`${colors.background.base} ${border.universal} ${rounded.component.button.md}`}>
      <h2 className={`${heading.h2} ${text.primary}`}>Title</h2>
      <p className={`${body.DEFAULT} ${text.secondary}`}>Description</p>
      <button className={`${primary.DEFAULT} ${primary.hover}`}>Click</button>
    </div>
  )
}

// AFTER
'use client'

import { cn } from '@/lib/utils'

export const MyComponent = () => {
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md">
      <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Title</h2>
      <p className="text-base text-neutral-600 dark:text-neutral-400">Description</p>
      <button className="bg-blue-500 text-white hover:bg-blue-600">Click</button>
    </div>
  )
}
```

## 🚀 Quick Conversion Commands

```bash
# Check remaining files
find src/features -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/config/theme" | wc -l

# List all remaining files
find src/features -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/config/theme"

# Run lint after conversion
npm run lint

# Run type check
npm run typecheck
```

## ⚠️ Common Pitfalls

1. **Forgetting dark mode variants** - Always add `dark:` prefix for backgrounds, text, borders
2. **Breaking dynamic colors** - Keep inline styles for tag colors, event colors, etc.
3. **Missing cn() import** - When using conditional classes, import `cn` from `@/lib/utils`
4. **Over-nesting template literals** - Flatten into simple string concatenation or use `cn()`
5. **Incorrect color mapping** - Use the reference table above for exact matches

## 📊 Progress Tracking

**Files Converted**: 7/27 (26%)
**Files Remaining**: 20
**Estimated Time**: ~3-4 hours for remaining files

### Progress by Category:
- ✅ Event Creation: 2/6 (33%)
- ✅ Event Common: 2/2 (100%)
- ⏳ Event Edit: 1/5 (20%)
- ⏳ Event Inspector: 2/2 (100% - already done)
- ⏳ Calendar Components: 0/10 (0%)
- ⏳ Calendar Constants: 0/2 (0%)

## 🎯 Next Steps

1. Complete remaining Event Edit components (4 files)
2. Complete Event Create components (4 files)
3. Complete Calendar Header components (3 files)
4. Complete Calendar Common components (2 files)
5. Complete Calendar View components (2 files)
6. Complete Calendar Constants (2 files)
7. Run full lint check
8. Visual regression testing
9. Update documentation

## 📞 Support

If you encounter issues:
1. Check the conversion reference table above
2. Look at completed files for examples (TagInput.tsx, EditHeader.tsx)
3. Verify dark mode variants are included
4. Test component in both light and dark modes

---

**Generated**: 2025-10-01
**Author**: Claude Code
**Version**: 1.0
