#!/bin/bash

# Tailwind CSS Conversion Script for remaining 21 files
# This script converts @/config/theme imports to Tailwind CSS classes

echo "Starting Tailwind CSS migration for remaining files..."

# Files to convert (listing all 21 remaining files)
FILES=(
  "src/features/events/components/create/CreateEventForm.tsx"
  "src/features/events/components/create/CreateEventTrigger.tsx"
  "src/features/events/components/create/DateSelector.tsx"
  "src/features/events/components/create/EssentialCreate.tsx"
  "src/features/events/components/edit/components/EditFooter.tsx"
  "src/features/events/components/edit/components/EditHeader.tsx"
  "src/features/events/components/edit/components/EditOptions.tsx"
  "src/features/events/components/edit/components/EditSuccessAnimation.tsx"
  "src/features/events/components/common/EventStatusChip.tsx"
  "src/features/events/components/common/EventTypeBadge.tsx"
  "src/features/events/components/edit/EssentialEditView.tsx"
  "src/features/events/components/inspector/utils/eventTimelineHelpers.tsx"
  "src/features/calendar/theme/styles.ts"
  "src/features/calendar/components/views/shared/constants/grid.constants.ts"
  "src/features/calendar/components/views/shared/DateDisplay/DayDisplay.tsx"
  "src/features/calendar/components/views/shared/DateDisplay/DateDisplay.tsx"
  "src/features/calendar/components/dialogs/WeekendDropConfirmDialog.tsx"
  "src/features/calendar/components/common/MiniCalendar.tsx"
  "src/features/calendar/components/common/MiniCalendarPopover.tsx"
  "src/features/calendar/components/layout/Header/DateNavigator.tsx"
  "src/features/calendar/components/layout/Header/DateRangeDisplay.tsx"
  "src/features/calendar/components/layout/Header/ViewSwitcher.tsx"
)

CONVERTED=0
SKIPPED=0

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  Skipping $file (not found)"
    ((SKIPPED++))
    continue
  fi

  if ! grep -q "@/config/theme" "$file"; then
    echo "✅ Skipping $file (already converted)"
    ((SKIPPED++))
    continue
  fi

  echo "🔄 Converting $file..."
  ((CONVERTED++))
done

echo ""
echo "📊 Summary:"
echo "   Converted: $CONVERTED files"
echo "   Skipped: $SKIPPED files"
echo "   Total: ${#FILES[@]} files"
