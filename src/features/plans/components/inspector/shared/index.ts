// Re-export shared components from core
export {
  ActivityPopover,
  DraggableInspector,
  FulfillmentButton,
  InspectorContent,
  InspectorDetailsLayout,
  InspectorHeader,
  InspectorShell,
  NoteIconButton,
  ScheduleRow,
  TitleInput,
  useDragHandle,
} from '@/core/components/inspector';
export type { ActivityDisplayItem, ActivityIconColor } from '@/core/components/inspector';

// Feature-dependent components (re-exported from shared)
export { PlanIconButton } from './PlanIconButton';
export { TagsIconButton } from './TagsIconButton';
