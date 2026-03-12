/**
 * Storybook カスタムタグ定数
 *
 * Vitest addon の tags.exclude で docs-only / wip を除外し、
 * critical / visual でテスト優先度を管理する。
 *
 * @see https://storybook.js.org/docs/writing-stories/tags
 * @see https://storybook.js.org/docs/writing-tests/integrations/vitest-addon
 */
export const TAGS = {
  /** Visual regression テスト対象（Chromatic） */
  VISUAL: 'visual',
  /** ユーザーのcritical path */
  CRITICAL: 'critical',
  /** 作業中 — テストから除外 */
  WIP: 'wip',
  /** ドキュメント専用 — テストから除外 */
  DOCS_ONLY: 'docs-only',
} as const;
