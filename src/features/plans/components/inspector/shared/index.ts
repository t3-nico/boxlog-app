// Re-export shared components from core
export {
  ActivityPopover,
  DraggableInspector,
  InspectorContent,
  InspectorDetailsLayout,
  InspectorHeader,
  InspectorShell,
  NoteIconButton,
  TitleInput,
  useDragHandle,
} from '@/core/components/inspector';
export type { ActivityDisplayItem, ActivityIconColor } from '@/core/components/inspector';

// Feature-dependent components (remain local)
export { FulfillmentButton } from './FulfillmentButton';
export { PlanIconButton } from './PlanIconButton';
export { ScheduleRow } from './ScheduleRow';
export { TagsIconButton } from './TagsIconButton';
