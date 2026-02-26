/**
 * グループ化されたデータの共通インターフェース
 *
 * Plan/Record両方のグルーピングで使用する汎用型
 */
export interface GroupedData<T> {
  groupKey: string;
  groupLabel: string;
  items: T[];
  count: number;
}
