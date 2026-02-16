import { useEffect, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { useCalendarDragStore } from '@/features/calendar/stores/useCalendarDragStore';
import type { CalendarPlan } from '@/features/calendar/types/calendar.types';
import type { Tag } from '@/features/tags/types';

import { DragSelectionPreview } from '@/features/calendar/components/views/shared/components/CalendarDragSelection/DragSelectionPreview';
import { PanelDragPreview } from '@/features/calendar/components/views/shared/components/PanelDragPreview';
import { PlanCard } from '@/features/calendar/components/views/shared/components/PlanCard/PlanCard';
import { TagSortableTree } from '@/features/tags/components/sortable-tree/TagSortableTree';

/**
 * DnD（Drag & Drop）に関わる全ビジュアル状態のカタログ。
 *
 * ## アーキテクチャ概要
 *
 * BoxLogのDnDは **3つの独立した層** で構成されている。
 *
 * | 層 | 方式 | 用途 |
 * |---|---|---|
 * | **ローカル層** | カスタム mouse/touch ハンドラ (`useDragAndDrop`) | カレンダー内カード移動・リサイズ |
 * | **グローバル層** | Zustand (`useCalendarDragStore`) | 複数日付間のドラッグ状態共有 |
 * | **プロバイダー層** | @dnd-kit (`DnDProvider`) | パネル↔カレンダー間ドラッグ |
 *
 * ### グリッド定数 (`grid.constants.ts`)
 * - `HOUR_HEIGHT = 72px` — 1時間あたりの高さ
 * - `MINUTE_HEIGHT = 1.2px` — 1分あたりの高さ
 * - `TIME_COLUMN_WIDTH = 56px` — 左側の時間列幅
 *
 * ### タグ並び替え
 * タグDnDは `TagSortableTree` コンポーネントが @dnd-kit で自己完結しており、
 * TagReorder / TagReorderNested でインタラクティブに操作可能。
 */
const meta = {
  title: 'Components/DragAndDrop',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// ヘルパー
// ---------------------------------------------------------------------------

/** PlanCard/DragSelectionPreviewはposition:absoluteのため、relativeな親が必要。 */
function Slot({ children, height = 72 }: { children: React.ReactNode; height?: number }) {
  return (
    <div className="relative w-full" style={{ height }}>
      {children}
    </div>
  );
}

/** ストーリーのラベル表示。 */
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mb-2 text-sm">{children}</p>;
}

/** Docs用の解説ブロック。 */
function DocsNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-muted-foreground border-border mb-4 rounded-md border p-4 text-xs leading-relaxed">
      {children}
    </div>
  );
}

/** 関連ファイルリスト。 */
function FileList({ files }: { files: Array<{ path: string; role: string }> }) {
  return (
    <table className="text-muted-foreground mt-2 w-full text-xs">
      <tbody>
        {files.map(({ path, role }) => (
          <tr key={path} className="border-border border-b last:border-0">
            <td className="py-1 pr-4 font-mono">{path}</td>
            <td className="py-1">{role}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const basePlan: CalendarPlan = {
  id: 'plan-1',
  title: 'Design Review',
  description: 'Weekly design sync',
  startDate: new Date('2024-01-15T10:00:00'),
  endDate: new Date('2024-01-15T11:00:00'),
  status: 'open',
  color: 'var(--primary)',
  createdAt: new Date(),
  updatedAt: new Date(),
  displayStartDate: new Date('2024-01-15T10:00:00'),
  displayEndDate: new Date('2024-01-15T11:00:00'),
  duration: 60,
  isMultiDay: false,
  isRecurring: false,
  type: 'plan',
};

const basePosition = {
  top: 0,
  left: 0,
  width: 100,
  height: 72,
};

const formatTime = (hour: number, minute: number) => {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

// ---------------------------------------------------------------------------
// Calendar→Calendar ドラッグ系
// ---------------------------------------------------------------------------

/**
 * カレンダー内ドラッグ中の状態（isDragging=true）。掴んでいるカードの見た目。
 *
 * ### データフロー
 * ```
 * PlanCard onMouseDown
 *   → useDragAndDrop.handleMouseDown
 *   → useDragHandler（マウスムーブ中の位置計算）
 *   → useCalendarDragStore.startDrag（グローバル状態更新）
 *   → PlanCard isDragging=true（opacity低下 + z-30）
 * ```
 *
 * ### 実装方式
 * dnd-kit ではなく**カスタム mouse/touch ハンドラ**で実装。
 * `useDragAndDrop` がマウスイベントを直接購読し、グリッドDOM測定を行う。
 * タッチは500ms長押しで起動。15分単位でスナップ。
 */
export const CalendarDrag: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <DocsNote>
        <strong>Calendar → Calendar ドラッグ</strong>
        <p className="mt-1">
          カスタム mouse/touch ハンドラで実装（dnd-kit 不使用）。
          グリッドDOM測定に依存するため、Storyではビジュアル状態のみ表示。
        </p>
        <FileList
          files={[
            { path: 'hooks/drag-and-drop/useDragAndDrop.ts', role: 'ローカルDnD状態管理' },
            { path: 'hooks/drag-and-drop/useDragHandler.ts', role: 'マウスムーブ位置計算' },
            { path: 'stores/useCalendarDragStore.ts', role: 'グローバルドラッグ状態' },
            { path: 'components/PlanCard/PlanCard.tsx', role: 'ドラッグ対象カード' },
          ]}
        />
      </DocsNote>
      <Label>isDragging=true: opacity低下 + zIndex上昇</Label>
      <Slot>
        <PlanCard plan={basePlan} position={basePosition} isDragging />
      </Slot>
    </div>
  ),
};

/**
 * 選択状態のカード（isSelected=true）。
 * Ctrl+Click / Cmd+Click で複数選択時に ring-2 ring-primary でハイライト。
 */
export const CalendarDragSelected: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label>isSelected=true: ring-2 ring-primary ハイライト（Ctrl/Cmd+Click）</Label>
      <Slot>
        <PlanCard plan={basePlan} position={basePosition} isSelected />
      </Slot>
    </div>
  ),
};

/**
 * アクティブ状態のカード（isActive=true）。
 * カードクリックでInspector表示中のハイライト。isSelectedとは排他。
 */
export const CalendarDragActive: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label>isActive=true: Inspector表示中のハイライト</Label>
      <Slot>
        <PlanCard plan={basePlan} position={basePosition} isActive />
      </Slot>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// リサイズハンドル
// ---------------------------------------------------------------------------

/**
 * PlanCardの下端にあるリサイズハンドル領域。
 *
 * ### 仕組み
 * - カード下端 8px がリサイズ領域（透明、cursor: ns-resize）
 * - **開始時刻は固定**、高さ（=終了時刻）のみ変更
 * - 15分単位でスナップ（`snapToQuarterHour`）
 * - リサイズ中にリアルタイム重複チェック → 重複時は赤オーバーレイ表示
 *
 * ### データフロー
 * ```
 * ハンドル onMouseDown
 *   → useResizeHandler.handleResizeStart
 *   → mousemove: deltaY → newHeight 計算 → snapToQuarterHour
 *   → 重複チェック → 視覚的フィードバック
 *   → mouseup: 確定 → API更新
 * ```
 */
export const ResizeHandle: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <DocsNote>
        <strong>リサイズ（下端ドラッグ）</strong>
        <p className="mt-1">
          カスタム mouse ハンドラで実装。開始時刻は固定、高さ（=終了時刻）のみ変更。 15分スナップ +
          リアルタイム重複チェック。
        </p>
        <FileList
          files={[
            {
              path: 'hooks/drag-and-drop/useResizeHandler.ts',
              role: 'リサイズ中の高さ計算・重複チェック',
            },
            {
              path: 'shared/constants/grid.constants.ts',
              role: 'HOUR_HEIGHT=72px, MINUTE_HEIGHT=1.2px',
            },
          ]}
        />
      </DocsNote>
      <Label>
        リサイズハンドルはカード下端8pxに存在（透明）。ホバーで cursor: ns-resize に変化。
      </Label>
      <Slot height={120}>
        <PlanCard plan={basePlan} position={{ ...basePosition, height: 120 }} />
      </Slot>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Panel→Calendar ドラッグ系
// ---------------------------------------------------------------------------

/**
 * パネル→カレンダードラッグのプレビュー。
 *
 * ### 仕組み
 * サイドバーの PlanCard を @dnd-kit の `useDraggable` でドラッグ開始し、
 * カレンダーグリッド側の `useDroppable` でドロップ先を判定。
 *
 * ### データフロー
 * ```
 * PanelPlanCard (useDraggable)
 *   → DnDProvider.onDragStart → useCalendarDragStore.startPanelDrag
 *   → DnDProvider.onDragMove  → targetDateIndex / previewTime 更新
 *   → PanelDragPreview 表示（dragSource === 'panel' で自動検知）
 *   → DnDProvider.onDragEnd   → dropData 解析 → updatePlan API
 * ```
 *
 * ### ストアの役割
 * `useCalendarDragStore` がパネルドラッグ状態をグローバルに共有。
 * `PanelDragPreview` は `dragSource === 'panel'` のときだけ表示される。
 */

/** PanelDragPreview用のラッパー。useCalendarDragStoreにパネルドラッグ状態をセット。 */
function PanelDragPreviewStory() {
  useEffect(() => {
    const start = new Date('2024-01-15T10:00:00');
    const end = new Date('2024-01-15T11:00:00');

    useCalendarDragStore.setState({
      dragSource: 'panel',
      targetDateIndex: 0,
      snappedPosition: { top: 0, height: 72 },
      previewTime: { start, end },
      isDragging: true,
      draggedPlanData: {
        id: 'panel-plan-1',
        title: 'Panel Drag Preview',
        status: 'open',
        user_id: 'user-1',
        description: null,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        reminder_minutes: null,
        reminder_at: null,
        reminder_sent: false,
        recurrence_rule: null,
        recurrence_type: null,
        recurrence_end_date: null,
        due_date: null,
        tagIds: [],
      },
    });

    return () => {
      useCalendarDragStore.getState().endDrag();
    };
  }, []);

  return (
    <Slot>
      <PanelDragPreview dayIndex={0} />
    </Slot>
  );
}

/** パネルからカレンダーへドラッグ中のプレビュー。ストア経由で描画。 */
export const PanelDragPreviewStoryExport: Story = {
  name: 'PanelDragPreview',
  render: () => (
    <div className="flex flex-col gap-2">
      <DocsNote>
        <strong>Panel → Calendar ドラッグ</strong>
        <p className="mt-1">
          @dnd-kit の DndContext で実装。サイドバーから PlanCard をドラッグし、
          カレンダーグリッドにドロップ。PointerSensor（8px移動）/ TouchSensor（250ms長押し）。
        </p>
        <FileList
          files={[
            { path: 'providers/DnDProvider.tsx', role: 'dnd-kit コンテキスト + DragOverlay' },
            { path: 'stores/useCalendarDragStore.ts', role: 'パネルドラッグ状態をグローバル共有' },
            { path: 'components/PanelDragPreview.tsx', role: 'ドロップ先プレビュー表示' },
          ]}
        />
      </DocsNote>
      <Label>Panel → Calendar ドラッグ中のドロップ先プレビュー</Label>
      <PanelDragPreviewStory />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 時間選択ドラッグ系
// ---------------------------------------------------------------------------

/**
 * 空き領域をドラッグして時間範囲を選択するプレビュー。
 *
 * ### 仕組み
 * カレンダーグリッドの空き領域をマウスドラッグすると、
 * 選択範囲が `DragSelectionPreview` で表示される。
 * ドラッグ終了時にコンテキストメニューが表示され、新規プラン作成が可能。
 *
 * ### データフロー
 * ```
 * グリッド空き領域 onMouseDown
 *   → DragSelectionLayer.handleDragStart
 *   → mousemove: startHour/endHour 計算
 *   → DragSelectionPreview 表示（通常: 青背景 / 重複: 赤背景+⊘）
 *   → mouseup: コンテキストメニュー → 新規プラン作成
 * ```
 */
export const TimeSelection: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <DocsNote>
        <strong>時間選択ドラッグ</strong>
        <p className="mt-1">
          グリッド空き領域のドラッグで時間帯を選択。ドラッグ終了時にコンテキストメニューから新規プラン作成。
          既存プランと重複する場合は赤背景 + ⊘アイコンで警告。
        </p>
        <FileList
          files={[
            { path: 'components/CalendarDragSelection/', role: '時間選択UI本体' },
            { path: 'components/DragSelectionLayer.tsx', role: 'ドラッグイベント管理レイヤー' },
            { path: 'components/DragSelectionPreview.tsx', role: '選択範囲のプレビュー表示' },
          ]}
        />
      </DocsNote>
      <Label>空き領域ドラッグで時間選択（通常状態）</Label>
      <Slot>
        <DragSelectionPreview
          selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
          formatTime={formatTime}
        />
      </Slot>
    </div>
  ),
};

/** 時間選択中に既存プランと重複している場合のエラー表示。 */
export const TimeSelectionOverlap: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label>時間選択 + 重複エラー（赤背景 + Ban アイコン）</Label>
      <Slot>
        <DragSelectionPreview
          selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
          formatTime={formatTime}
          isOverlapping
        />
      </Slot>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// タグ並び替え（インタラクティブデモ）
// ---------------------------------------------------------------------------

/**
 * ### タグ並び替え — インタラクティブデモ
 *
 * `TagSortableTree` は @dnd-kit で自己完結したコンポーネント。
 * 外部の Context やグリッドレイアウトに依存しないため、
 * Story 上でそのままドラッグ操作が可能。
 *
 * #### 制約
 * - **2階層制限**: 親タグ → 子タグの1階層のみ
 * - **子持ち親タグ**: 常に depth 0 を維持（子ごとルート移動不可）
 * - **8px 距離**: マウス8px移動でドラッグ開始（クリックと区別）
 *
 * #### データフロー
 * ```
 * ドラッグ開始 → DndContext.onDragStart → activeId セット
 * ドラッグ中   → DndContext.onDragMove  → offsetLeft → getProjection（深度計算）
 * ドロップ     → DndContext.onDragEnd   → arrayMove → buildTree → onReorder コールバック
 * ```
 */

const now = new Date().toISOString();

/** フラットタグ3個（シンプルな並び替えデモ用） */
const flatMockTags: Tag[] = [
  {
    id: 'tag-1',
    name: 'Work',
    color: '#3B82F6',
    parent_id: null,
    sort_order: 0,
    user_id: 'demo-user',
    description: null,
    icon: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'tag-4',
    name: 'Personal',
    color: '#F59E0B',
    parent_id: null,
    sort_order: 1,
    user_id: 'demo-user',
    description: null,
    icon: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'tag-6',
    name: 'Learning',
    color: '#06B6D4',
    parent_id: null,
    sort_order: 2,
    user_id: 'demo-user',
    description: null,
    icon: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
];

/** 親3個+子3個の2階層構造（階層ドラッグデモ用） */
const nestedMockTags: Tag[] = [
  {
    id: 'tag-1',
    name: 'Work',
    color: '#3B82F6',
    parent_id: null,
    sort_order: 0,
    user_id: 'demo-user',
    description: null,
    icon: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'tag-2',
    name: 'Meetings',
    color: '#10B981',
    parent_id: 'tag-1',
    sort_order: 0,
    user_id: 'demo-user',
    description: null,
    icon: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'tag-3',
    name: 'Deep Work',
    color: '#8B5CF6',
    parent_id: 'tag-1',
    sort_order: 1,
    user_id: 'demo-user',
    description: null,
    icon: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'tag-4',
    name: 'Personal',
    color: '#F59E0B',
    parent_id: null,
    sort_order: 1,
    user_id: 'demo-user',
    description: null,
    icon: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'tag-5',
    name: 'Exercise',
    color: '#EF4444',
    parent_id: 'tag-4',
    sort_order: 0,
    user_id: 'demo-user',
    description: null,
    icon: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
  {
    id: 'tag-6',
    name: 'Learning',
    color: '#06B6D4',
    parent_id: null,
    sort_order: 2,
    user_id: 'demo-user',
    description: null,
    icon: null,
    is_active: true,
    created_at: now,
    updated_at: now,
  },
];

interface TagReorderDemoProps {
  initialTags: Tag[];
  tagCounts: Record<string, number>;
  parentTagCounts: Record<string, number>;
}

function TagReorderDemo({ initialTags, tagCounts, parentTagCounts }: TagReorderDemoProps) {
  const [tags, setTags] = useState<Tag[]>(initialTags);

  const handleReorder = (
    updates: Array<{ id: string; sort_order: number; parent_id: string | null }>,
  ) => {
    setTags((prev) => {
      const next = prev.map((tag) => {
        const update = updates.find((u) => u.id === tag.id);
        if (update) {
          return { ...tag, sort_order: update.sort_order, parent_id: update.parent_id };
        }
        return tag;
      });
      return next.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    });
  };

  return (
    <div className="w-64">
      <TagSortableTree
        tags={tags}
        visibleTagIds={new Set(tags.map((t) => t.id))}
        tagCounts={tagCounts}
        parentTagCounts={parentTagCounts}
        onToggleTag={fn()}
        onToggleGroupTags={fn()}
        onUpdateTag={fn()}
        onDeleteTag={fn()}
        onAddChildTag={fn()}
        onShowOnlyTag={fn()}
        onShowOnlyGroupTags={fn()}
        onOpenMergeModal={fn()}
        onReorder={handleReorder}
      />
    </div>
  );
}

/** フラットなタグ3個をドラッグで並び替え。実際にドラッグ操作が可能。 */
export const TagReorder: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label>タグをドラッグで並び替え（フラット3個）</Label>
      <TagReorderDemo
        initialTags={flatMockTags}
        tagCounts={{ 'tag-1': 5, 'tag-4': 4, 'tag-6': 6 }}
        parentTagCounts={{}}
      />
    </div>
  ),
};

/** 親3個+子3個の階層構造をドラッグで並び替え。子タグの親変更も可能。 */
export const TagReorderNested: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label>階層タグをドラッグで並び替え（親3個+子3個）— 子→ルートへの移動も可</Label>
      <TagReorderDemo
        initialTags={nestedMockTags}
        tagCounts={{
          'tag-1': 5,
          'tag-2': 3,
          'tag-3': 2,
          'tag-4': 4,
          'tag-5': 1,
          'tag-6': 6,
        }}
        parentTagCounts={{ 'tag-1': 10, 'tag-4': 5 }}
      />
    </div>
  ),
};

// ---------------------------------------------------------------------------
// 全状態一覧
// ---------------------------------------------------------------------------

/** 全DnD状態を一覧表示。 */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <section>
        <Label>1. CalendarDrag — isDragging=true</Label>
        <Slot>
          <PlanCard plan={basePlan} position={basePosition} isDragging />
        </Slot>
      </section>

      <section>
        <Label>2. CalendarDragSelected — isSelected=true</Label>
        <Slot>
          <PlanCard plan={basePlan} position={basePosition} isSelected />
        </Slot>
      </section>

      <section>
        <Label>3. CalendarDragActive — isActive=true</Label>
        <Slot>
          <PlanCard plan={basePlan} position={basePosition} isActive />
        </Slot>
      </section>

      <section>
        <Label>4. ResizeHandle — カード下端8pxにリサイズハンドル</Label>
        <Slot height={120}>
          <PlanCard plan={basePlan} position={{ ...basePosition, height: 120 }} />
        </Slot>
      </section>

      <section>
        <Label>5. PanelDragPreview — Panel → Calendar ドロップ先プレビュー</Label>
        <PanelDragPreviewStory />
      </section>

      <section>
        <Label>6. TimeSelection — 空き領域ドラッグで時間選択</Label>
        <Slot>
          <DragSelectionPreview
            selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
            formatTime={formatTime}
          />
        </Slot>
      </section>

      <section>
        <Label>7. TimeSelectionOverlap — 時間選択（重複エラー）</Label>
        <Slot>
          <DragSelectionPreview
            selection={{ startHour: 0, startMinute: 0, endHour: 1, endMinute: 0 }}
            formatTime={formatTime}
            isOverlapping
          />
        </Slot>
      </section>
    </div>
  ),
};
