/** Reflection（AI日報）のデータ構造 */
export interface Reflection {
  id: string;
  /** 対象日（YYYY-MM-DD） */
  date: string;
  /** AIが生成する一日のタイトル */
  title: string;
  /** 事実の要約（Records/Plansから抽出） */
  activities: ActivitySummary[];
  /** AIの所感（マークダウン） */
  insights: string;
  /** AIからのポジティブな問いかけ */
  question: string;
  /** ユーザーの自由メモ */
  userNote: string;
  createdAt: string;
  updatedAt: string;
}

/** アクティビティの要約 */
export interface ActivitySummary {
  /** タグ名 or タスク名 */
  label: string;
  /** 所要時間（分） */
  duration?: number;
  /** タスク数 */
  count?: number;
  /** 種別 */
  type: 'record' | 'plan';
}
