/**
 * グリッド計算ユーティリティ
 *
 * @deprecated engine/grid.ts から直接importしてください。
 * このファイルは後方互換性のための re-export です。
 */

export {
  calculateGridHeight,
  calculateScrollPosition,
  getDurationInMinutes,
  getEventStyle,
  isTimeInRange,
  pixelsToTime,
  pixelsToTimeValues,
  roundToQuarterHour,
  timeToPixels,
} from '../../../../engine/grid';
