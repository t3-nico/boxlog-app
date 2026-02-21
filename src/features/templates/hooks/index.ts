/**
 * Templates Hooks - Public API
 */

// Template Query Keys
export { templateKeys } from './templateQueryKeys';

// Template Query Hooks
export { useTemplate, useTemplates } from './useTemplatesQuery';

// Template Mutation Hooks
export {
  useCreateTemplate,
  useDeleteTemplate,
  useIncrementTemplateUseCount,
  useUpdateTemplate,
} from './useTemplateMutations';
