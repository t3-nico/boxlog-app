/**
 * イベント配置計算フック
 */

import { useMemo } from 'react';

import { useCollapsedSectionsContext } from '../../../../contexts/CollapsedSectionsContext';
import { HOUR_HEIGHT } from '../constants/grid.constants';
import type { EventPosition, TimedEvent } from '../types/plan.types';
import {
  calculateEventPosition,
  calculateEventPositionWithCollapse,
  calculateViewEventColumns,
} from '../utils/planPositioning';

export interface UseEventPositionOptions {
  hourHeight?: number;
}

export interface PositionedEvent extends TimedEvent {
  position: EventPosition;
}

export function useEventPosition(events: TimedEvent[], options: UseEventPositionOptions = {}) {
  const { hourHeight = HOUR_HEIGHT } = options;
  const collapsedContext = useCollapsedSectionsContext();

  const eventPositions = useMemo(() => {
    const positions = new Map<string, EventPosition>();

    if (events.length === 0) return positions;

    // イベントの列配置を計算
    const columns = calculateViewEventColumns(events);

    // 折りたたみがある場合は折りたたみ考慮の計算を使用
    if (collapsedContext?.hasCollapsedSections) {
      events.forEach((event) => {
        const column = columns.get(event.id);
        if (!column) return;

        const position = calculateEventPositionWithCollapse(
          event,
          column,
          collapsedContext.timeToPixels,
        );

        positions.set(event.id, {
          top: position.top,
          left: position.left,
          width: position.width,
          height: position.height,
          zIndex: 10,
        });
      });
    } else {
      // 通常の計算
      events.forEach((event) => {
        const column = columns.get(event.id);
        if (!column) return;

        const position = calculateEventPosition(event, column, hourHeight);

        positions.set(event.id, {
          top: position.top,
          left: position.left,
          width: position.width,
          height: position.height,
          zIndex: 10,
        });
      });
    }

    return positions;
  }, [events, hourHeight, collapsedContext]);

  return eventPositions;
}

/**
 * イベントと位置を結合して配置済みイベントを返すフック
 * （既存の /shared/hooks との互換性のため）
 */
export function usePositionedEvents(
  events: TimedEvent[],
  options: UseEventPositionOptions = {},
): PositionedEvent[] {
  const positions = useEventPosition(events, options);

  return useMemo(() => {
    return events.map((event) => ({
      ...event,
      position: positions.get(event.id) || {
        top: 0,
        left: 0,
        width: 100,
        height: 20,
        zIndex: 10,
      },
    }));
  }, [events, positions]);
}

// 後方互換性のためのエイリアス
export { useEventPosition as usePlanPosition };
