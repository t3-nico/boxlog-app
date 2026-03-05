/**
 * Re-export from shared lib for backward compatibility
 * 実体は @/lib/tag-colors に移動済み
 */
export {
  DEFAULT_GROUP_COLOR,
  DEFAULT_TAG_COLOR,
  TAG_COLOR_MAP,
  TAG_COLOR_NAMES,
  TAG_COLOR_PALETTE,
  TAG_DESCRIPTION_MAX_LENGTH,
  TAG_GROUP_NAME_MAX_LENGTH,
  TAG_NAME_MAX_LENGTH,
  getTagColorClasses,
  resolveTagColor,
} from '@/lib/tag-colors';
export type { TagColorName } from '@/lib/tag-colors';
