/** StatsView のプロパティ */
export interface StatsViewProps {
  className?: string | undefined;
}

/** Hero カードのデータ */
export interface StatsHeroData {
  plannedMinutes: number;
  actualMinutes: number;
  progressPercent: number;
  previousActualMinutes: number;
  hoursDelta: number;
}

/** タグ別ブレイクダウン */
export interface StatsTagBreakdown {
  tagId: string;
  tagName: string;
  tagColor: string;
  parentId: string | null;
  plannedMinutes: number;
  actualMinutes: number;
  previousActualMinutes: number;
}

/** getStatsViewData の戻り値型 */
export interface StatsViewData {
  hero: StatsHeroData;
  tagBreakdown: StatsTagBreakdown[];
}
