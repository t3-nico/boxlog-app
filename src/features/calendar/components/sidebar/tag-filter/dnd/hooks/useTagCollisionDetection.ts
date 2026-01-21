/**
 * タグDnD用カスタム衝突検出
 *
 * @description
 * dnd-kitのclosestCenterと独自ドロップゾーン判定を統合
 * - handleDragMoveを廃止し、衝突検出内でゾーン計算を完結
 * - Collision.dataにzone情報を含めて返す
 */

import { closestCenter, type CollisionDetection } from '@dnd-kit/core';
import { useCallback, useRef } from 'react';

import type { DragItem, DropTarget, DropZone, FlatItem } from '../types';
import { ZONE_THRESHOLDS } from '../types';

interface UseTagCollisionDetectionProps {
  flatItems: FlatItem[];
  activeItem: DragItem | null;
}

interface UseTagCollisionDetectionReturn {
  collisionDetection: CollisionDetection;
  /** 現在のドロップターゲット（視覚フィードバック用） */
  dropTarget: DropTarget | null;
  /** ポインタ位置を更新（pointermoveイベントから呼び出し） */
  updatePointerPosition: (x: number, y: number) => void;
}

/**
 * カスタム衝突検出フック
 *
 * @example
 * ```tsx
 * const { collisionDetection, dropTarget, updatePointerPosition } = useTagCollisionDetection({
 *   flatItems,
 *   activeItem,
 *   sortableGroupIds,
 * });
 *
 * // DndContext に渡す
 * <DndContext collisionDetection={collisionDetection} ... />
 *
 * // 視覚フィードバックに dropTarget を使用
 * {dropTarget?.zone === 'before' && <DropIndicator position="top" />}
 * ```
 */
export function useTagCollisionDetection({
  flatItems,
  activeItem,
}: UseTagCollisionDetectionProps): UseTagCollisionDetectionReturn {
  // ポインタ位置（pointermoveでリアルタイム更新）
  const pointerPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  // 現在のドロップターゲット（視覚フィードバック用）
  const dropTargetRef = useRef<DropTarget | null>(null);

  const updatePointerPosition = useCallback((x: number, y: number) => {
    pointerPositionRef.current = { x, y };
  }, []);

  /**
   * 要素のDOM IDを取得
   */
  const getElementId = (itemId: string, itemType: FlatItem['type']): string => {
    switch (itemType) {
      case 'group-header':
        return `group-header-${itemId}`;
      case 'child-tag':
        return `child-tag-${itemId}`;
      case 'ungrouped-tag':
        return `ungrouped-tag-${itemId}`;
    }
  };

  /**
   * ポインタ位置からゾーンを計算
   */
  const calculateZone = (pointerY: number, rect: DOMRect, itemType: FlatItem['type']): DropZone => {
    const relativeY = pointerY - rect.top;
    const percentage = relativeY / rect.height;

    switch (itemType) {
      case 'group-header': {
        const { before, after } = ZONE_THRESHOLDS.groupHeader;
        if (percentage < before) return 'before';
        if (percentage > after) return 'after';
        return 'into';
      }
      case 'ungrouped-tag': {
        const { before, after } = ZONE_THRESHOLDS.ungroupedTag;
        if (percentage < before) return 'before';
        if (percentage > after) return 'after';
        return 'into';
      }
      case 'child-tag': {
        const { before } = ZONE_THRESHOLDS.childTag;
        // 子タグは into ゾーンなし（並び替えのみ）
        return percentage < before ? 'before' : 'after';
      }
    }
  };

  /**
   * カスタム衝突検出
   *
   * 1. closestCenterで最も近い要素を取得
   * 2. ポインタ位置からゾーンを計算
   * 3. Collision.dataにゾーン情報を含めて返す
   */
  const collisionDetection: CollisionDetection = useCallback(
    (args) => {
      // ドラッグ中でない場合は空を返す
      if (!activeItem) {
        dropTargetRef.current = null;
        return [];
      }

      // closestCenterで最も近い要素を取得
      const collisions = closestCenter(args);
      const closestCollision = collisions[0];
      if (!closestCollision) {
        dropTargetRef.current = null;
        return [];
      }

      const targetId = closestCollision.id as string;

      // 自分自身へのドロップは除外
      if (targetId === activeItem.id) {
        dropTargetRef.current = null;
        return [];
      }

      // flatItemsから対象アイテムを取得
      const targetItem = flatItems.find((item) => item.id === targetId);
      if (!targetItem) {
        dropTargetRef.current = null;
        return collisions;
      }

      // ドラッグ対象がタグ以外の場合、ゾーン計算をスキップ
      if (activeItem.type !== 'tag') {
        // グループをドラッグ中 → シンプルな並び替えのみ
        if (targetItem.parentId === null) {
          const zone: DropZone = 'before'; // デフォルト
          dropTargetRef.current = {
            targetId,
            zone,
            targetType: targetItem.type,
          };
          return [
            {
              ...closestCollision,
              data: {
                ...closestCollision.data,
                zone,
                targetType: targetItem.type,
              },
            },
          ];
        }
        dropTargetRef.current = null;
        return collisions;
      }

      // 要素のDOM座標を取得
      const elementId = getElementId(targetId, targetItem.type);
      const element = document.getElementById(elementId);
      if (!element) {
        dropTargetRef.current = null;
        return collisions;
      }

      const rect = element.getBoundingClientRect();
      const pointerY = pointerPositionRef.current.y;

      // ゾーンを計算
      const zone = calculateZone(pointerY, rect, targetItem.type);

      // グループ間移動のバリデーション
      // 子タグをドラッグ中にungroupedタグの 'into' ゾーンに入る場合、beforeに補正
      // （子タグ → 孫タグの作成は許可しない）
      let finalZone = zone;
      if (activeItem.parentId !== null && targetItem.type === 'ungrouped-tag' && zone === 'into') {
        finalZone = 'before';
      }

      // ドロップターゲットを更新
      dropTargetRef.current = {
        targetId,
        zone: finalZone,
        targetType: targetItem.type,
      };

      // Collision.dataにゾーン情報を含めて返す
      return [
        {
          ...closestCollision,
          data: {
            ...closestCollision.data,
            zone: finalZone,
            targetType: targetItem.type,
          },
        },
      ];
    },
    [activeItem, flatItems],
  );

  return {
    collisionDetection,
    dropTarget: dropTargetRef.current,
    updatePointerPosition,
  };
}
