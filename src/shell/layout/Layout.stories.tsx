import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * ## Layout (`src/shell/layout/`)
 *
 * **feature依存のない、純粋なレイアウトプリミティブ**を置くディレクトリ。
 *
 * ### 設計原則
 *
 * `src/shell/layout/` にはアプリ全体のレイアウト責務を持つコンポーネントを配置する。
 * これにより **layout → features** という逆方向の依存を防ぎ、レイアウト層の安定性を保つ。
 *
 * ### 現在の構成
 *
 * | ファイル | 役割 |
 * |---|---|
 * | `base-layout.tsx` | Server Component。Suspense境界を提供 |
 * | `base-layout-content.tsx` | Client Component。Desktop/Mobileレイアウト切替のオーケストレーション |
 * | `desktop-layout.tsx` | デスクトップ用2カラム構成（Sidebar + Main） |
 * | `mobile-layout.tsx` | モバイル用シングルカラム構成（Sheet Sidebar） |
 * | `main-content-wrapper.tsx` | `<main>` 要素のラッパー |
 * | `PageHeader.tsx` | 非カレンダーページ用の共通ヘッダー |
 *
 * ### Sidebar はここに置かない
 *
 * | コンポーネント | 現在の場所 | ここに置かない理由 |
 * |---|---|---|
 * | `TagFilter` | `src/features/calendar/components/sidebar/` | calendar 固有のフィルタ状態と表示ロジックに依存 |
 * | `Plan/Record Aside` | `src/features/calendar/components/aside/` | calendar 固有のリスト表示と操作に依存 |
 *
 * これらはfeature固有の状態・データに強く依存しているため、
 * `src/features/` 配下に置くのが正しいアーキテクチャ。
 *
 * ### Storybook上の表示グループとの違い
 *
 * | Storybookパス | 物理ディレクトリ | 備考 |
 * |---|---|---|
 * | `Primitives/Layout/*` | `src/shell/layout/` | このディレクトリ |
 * | `Features/Calendar/Sidebar/*` | `src/features/calendar/components/sidebar/` | calendar feature の sidebar |
 * | `Features/Calendar/Aside/*` | `src/features/calendar/components/aside/` | calendar feature の aside |
 *
 * Storybookの表示グループ名とファイルの物理位置は独立しており、
 * 各コンポーネントの依存関係に基づいて物理配置を決定している。
 */
const meta = {
  title: 'Primitives/Layout/Overview',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** レイアウト構成の図解 */
export const Structure: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {/* Desktop Layout */}
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-medium">Desktop Layout</p>
        <div className="border-border flex h-[300px] overflow-hidden rounded-lg border">
          {/* Sidebar area */}
          <div className="bg-surface-container border-border flex w-48 flex-col border-r">
            <div className="border-border border-b p-3">
              <div className="text-muted-foreground text-xs">AppSidebar</div>
              <div className="text-muted-foreground/50 mt-1 text-[10px]">features/navigation/</div>
            </div>
            <div className="flex-1 p-3">
              <div className="text-muted-foreground/50 text-[10px]">Nav + Filters</div>
            </div>
          </div>

          {/* Main area */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* PageHeader */}
            <div className="border-border flex h-10 items-center border-b px-3">
              <div className="text-muted-foreground text-xs">PageHeader</div>
              <div className="text-muted-foreground/50 ml-2 text-[10px]">components/layout/</div>
            </div>

            {/* Content */}
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className="text-muted-foreground text-xs">MainContentWrapper</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5">
          <div className="bg-primary/20 size-3 rounded" />
          <span className="text-muted-foreground text-[10px]">
            components/layout/ (this directory)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="bg-surface-container size-3 rounded" />
          <span className="text-muted-foreground text-[10px]">features/ (feature-specific)</span>
        </div>
      </div>
    </div>
  ),
};
