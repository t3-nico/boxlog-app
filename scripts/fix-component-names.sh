#!/bin/bash

# Fix component names from camelCase to PascalCase

FILES=(
  "src/features/calendar/providers/DnDProvider.tsx"
  "src/features/calendar/components/CalendarController.tsx"
  "src/features/calendar/hooks/usePlanOperations.ts"
  "src/features/calendar/hooks/usePlanContextActions.ts"
  "src/features/inbox/components/table/InboxTableRow.tsx"
  "src/features/inbox/components/table/InboxTableRowCreate.tsx"
  "src/features/inbox/components/table/BulkDatePickerDialog.tsx"
  "src/features/inbox/components/table/BulkActionsToolbar.tsx"
  "src/features/board/components/shared/TicketCard.tsx"
  "src/features/board/components/TicketKanbanBoard.tsx"
  "src/features/plans/components/shared/PlanQuickCreate.tsx"
  "src/features/plans/components/shared/PlanCreatePopover.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    sed -i '' 's/\bupdateplan\b/updatePlan/g' "$file"
    sed -i '' 's/\bcreateplan\b/createPlan/g' "$file"
    sed -i '' 's/\bdeleteplan\b/deletePlan/g' "$file"
    sed -i '' 's/\bbulkUpdateplan\b/bulkUpdatePlan/g' "$file"
    sed -i '' 's/\bbulkDeleteplan\b/bulkDeletePlan/g' "$file"
  else
    echo "File not found: $file"
  fi
done

echo "Done!"
