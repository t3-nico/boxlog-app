/**
 * Templates Feature - Public API
 *
 * テンプレート機能の統一的なエントリーポイント。
 */

// Components
export { TemplateFormModal } from './components/TemplateFormModal';
export { TemplateListModal } from './components/TemplateListModal';

// Hooks
export {
  templateKeys,
  useCreateTemplate,
  useDeleteTemplate,
  useIncrementTemplateUseCount,
  useTemplate,
  useTemplates,
  useUpdateTemplate,
} from './hooks';

// Stores
export { useTemplateStore } from './stores/useTemplateStore';

// Types
export type {
  CreateTemplateInput,
  PlanTemplate,
  TemplatesResponse,
  UpdateTemplateInput,
} from './types';
