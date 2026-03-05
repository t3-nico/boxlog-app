// Re-export shared components from core
export {
  DraggableInspector,
  FulfillmentButton,
  InlineNoteSection,
  InspectorContent,
  InspectorDetailsLayout,
  InspectorHeader,
  InspectorShell,
  InspectorTagRow,
  InspectorTimeSection,
  NoteIconButton,
  ScheduleRow,
  TitleInput,
} from '@/core/components/inspector';

// Feature-dependent components (re-exported from shared)
export { PlanIconButton } from './PlanIconButton';
export { TagsIconButton } from './TagsIconButton';
