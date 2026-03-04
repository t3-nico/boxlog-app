// Re-export shared components from core
export {
  DraggableInspector,
  FulfillmentButton,
  InspectorContent,
  InspectorDetailsLayout,
  InspectorHeader,
  InspectorShell,
  InspectorTagRow,
  NoteIconButton,
  ScheduleRow,
  TimeComparisonSection,
  TitleInput,
  useDragHandle,
} from '@/core/components/inspector';

// Feature-dependent components (re-exported from shared)
export { PlanIconButton } from './PlanIconButton';
export { TagsIconButton } from './TagsIconButton';
