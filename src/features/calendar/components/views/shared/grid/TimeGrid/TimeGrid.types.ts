/**
 * TimeGrid専用の型定義
 */

export interface TimeGridClickEvent {
  hour: number;
  minute: number;
  pixelY: number;
  date?: Date;
}
