/**
 * CalendarFilterList DnD 関連の型定義
 *
 * @description
 * - DnDアイテム、ドロップゾーン、衝突検出結果の型を定義
 * - dnd-kitのカスタム衝突検出で使用
 */

/** ドロップゾーン（3分割に簡素化） */
export type DropZone = 'before' | 'into' | 'after';

/** ドラッグ中のアイテム情報 */
export interface DragItem {
  id: string;
  type: 'group' | 'tag';
  name: string;
  color: string;
  parentId: string | null;
  sortOrder: number;
}

/** フラットリスト用のアイテム型（dnd-kit対応） */
export interface FlatItem {
  id: string;
  type: 'group-header' | 'child-tag' | 'ungrouped-tag';
  name: string;
  color: string;
  description?: string | null;
  parentId: string | null;
  sortOrder: number;
  /** グループヘッダーは常にtrue、子タグ/ungroupedタグは常に表示 */
  isVisible: boolean;
}

/** ドロップターゲット情報（衝突検出結果） */
export interface DropTarget {
  targetId: string;
  zone: DropZone;
  targetType: FlatItem['type'];
}

/** カスタム衝突検出のデータ（dnd-kitのCollisionに付与） */
export interface TagCollisionData {
  zone: DropZone;
  targetType: FlatItem['type'];
}

/**
 * ゾーン判定の閾値設定
 *
 * グループヘッダー:
 * - before (上端15%): ルートレベルで前に挿入
 * - into (中央70%): グループの子として追加
 * - after (下端15%): ルートレベルで後に挿入
 *
 * ungroupedタグ:
 * - before (上端30%): 前に挿入
 * - into (中央40%): 子タグにする
 * - after (下端30%): 後に挿入
 *
 * 子タグ:
 * - before (上端50%): 前に挿入
 * - after (下端50%): 後に挿入（intoなし）
 */
export const ZONE_THRESHOLDS = {
  groupHeader: {
    before: 0.15,
    after: 0.85,
  },
  ungroupedTag: {
    before: 0.3,
    after: 0.7,
  },
  childTag: {
    before: 0.5,
    // childTagはintoゾーンなし（並び替えのみ）
  },
} as const;
