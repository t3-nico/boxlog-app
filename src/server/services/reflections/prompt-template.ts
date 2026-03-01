/**
 * Reflection Prompt Template
 *
 * 振り返りAI生成用のプロンプトを構築する。
 * 統計データ + 価値観ランキング + タグ別時間配分を基に、
 * 構造化されたJSONレポートを生成するプロンプトを組み立てる。
 */

import type {
  EnergyMapCell,
  FulfillmentTrendPoint,
  WeeklyReflectionData,
} from './data-aggregation-service';

/** プロンプトに渡すデータ */
export interface ReflectionPromptData {
  periodType: 'daily' | 'weekly' | 'monthly';
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD

  /** 週次集計データ */
  weeklyData: WeeklyReflectionData;

  /** 充実度トレンド（日別推移） */
  fulfillmentTrend: FulfillmentTrendPoint[];

  /** エネルギーマップ（時間帯×曜日） */
  energyMap: EnergyMapCell[];

  /** パーソナライゼーション */
  rankedValues: string[];
  lifeCategories: Array<{
    key: string;
    label: string;
    importance: number;
    note: string;
  }>;
}

/** AI生成結果のスキーマ */
export interface ReflectionGenerationResult {
  title: string;
  insights: string;
  question: string;
  activities: Array<{
    label: string;
    minutes: number;
    highlight: string;
  }>;
}

/** キーワードIDから英語ラベルへのマッピング */
const KEYWORD_LABELS: Record<string, string> = {
  integrity: 'Integrity',
  courage: 'Courage',
  curiosity: 'Curiosity',
  compassion: 'Compassion',
  creativity: 'Creativity',
  gratitude: 'Gratitude',
  freedom: 'Freedom',
  fairness: 'Fairness',
  perseverance: 'Perseverance',
  humor: 'Humor',
  honesty: 'Honesty',
  independence: 'Independence',
  kindness: 'Kindness',
  leadership: 'Leadership',
  learning: 'Learning',
  love: 'Love',
  loyalty: 'Loyalty',
  humility: 'Humility',
  adventure: 'Adventure',
  stability: 'Stability',
  trust: 'Trust',
  wisdom: 'Wisdom',
  beauty: 'Beauty',
  cooperation: 'Cooperation',
  discipline: 'Discipline',
  empathy: 'Empathy',
  tolerance: 'Tolerance',
  wellbeing: 'Well-being',
  hope: 'Hope',
  justice: 'Justice',
  peace: 'Peace',
  joy: 'Joy',
  responsibility: 'Responsibility',
  respect: 'Respect',
  safety: 'Safety',
  service: 'Service',
  simplicity: 'Simplicity',
  achievement: 'Achievement',
  teamwork: 'Teamwork',
  tradition: 'Tradition',
  diversity: 'Diversity',
  environmentalism: 'Environmentalism',
  connection: 'Connection',
  growth: 'Growth',
  passion: 'Passion',
  playfulness: 'Playfulness',
  balance: 'Balance',
  challenge: 'Challenge',
  contribution: 'Contribution',
  authenticity: 'Authenticity',
};

/**
 * 振り返り生成用システムプロンプトを構築
 */
export function buildReflectionPrompt(data: ReflectionPromptData): string {
  const sections: string[] = [];

  // ヘッダー
  sections.push(`You are "Dayopt AI", a personal time management assistant that generates weekly reflection reports.

Your task: Analyze the user's time data for the period ${data.periodStart} to ${data.periodEnd} and generate a structured reflection report.

Respond in the same language the user's data suggests. If tag names or notes are in Japanese, respond in Japanese. If in English, respond in English. Default to English if unclear.`);

  // 価値観コンテキスト
  if (data.rankedValues.length > 0) {
    const ranked = data.rankedValues
      .map((kw, i) => `${i + 1}. ${KEYWORD_LABELS[kw] ?? kw}`)
      .join('\n');
    sections.push(
      `## User's Core Values\nThese are the user's top personal values, ranked by importance. Connect observations about their time usage to these values where relevant:\n${ranked}`,
    );
  }

  // 12領域
  if (data.lifeCategories.length > 0) {
    const cats = data.lifeCategories
      .filter((c) => c.importance > 0)
      .sort((a, b) => b.importance - a.importance)
      .map((c) => {
        const noteStr = c.note ? ` — "${c.note}"` : '';
        return `- ${c.label}: ${c.importance}/10${noteStr}`;
      })
      .join('\n');
    sections.push(`## Life Domains\n${cats}`);
  }

  // 週次集計
  const wd = data.weeklyData;
  const totalHours = (wd.totalMinutes / 60).toFixed(1);
  sections.push(`## Weekly Summary
- Total entries: ${wd.totalEntries}
- Planned entries: ${wd.plannedEntries}
- Unplanned entries: ${wd.unplannedEntries}
- Total time: ${totalHours}h (${wd.totalMinutes} minutes)
- Average fulfillment: ${wd.avgFulfillment}/3
- Reviewed entries: ${wd.reviewedCount}`);

  // タグ別時間配分
  if (wd.tagBreakdown.length > 0) {
    const tagStr = wd.tagBreakdown
      .sort((a, b) => b.minutes - a.minutes)
      .map((t) => {
        const hours = (t.minutes / 60).toFixed(1);
        return `- ${t.tagName}: ${hours}h (${t.entryCount} entries)`;
      })
      .join('\n');
    sections.push(`## Time by Tag\n${tagStr}`);
  }

  // 充実度トレンド
  if (data.fulfillmentTrend.length > 0) {
    const trendStr = data.fulfillmentTrend
      .map((p) => `- ${p.date}: avg ${p.avgScore}/3 (${p.count} entries)`)
      .join('\n');
    sections.push(`## Fulfillment Trend (Daily)\n${trendStr}`);
  }

  // エネルギーマップ（上位セルのみ）
  if (data.energyMap.length > 0) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const topCells = data.energyMap
      .filter((c) => c.entryCount >= 2)
      .sort((a, b) => b.avgFulfillment - a.avgFulfillment)
      .slice(0, 10);

    if (topCells.length > 0) {
      const mapStr = topCells
        .map(
          (c) =>
            `- ${dayNames[c.dow]} ${c.hour}:00: fulfillment ${c.avgFulfillment}/3, ${Math.round(c.totalMinutes)}min (${c.entryCount} entries)`,
        )
        .join('\n');
      sections.push(`## Peak Performance Times (Top 10)\n${mapStr}`);
    }
  }

  // 出力指示
  sections.push(`## Output Instructions

Generate a JSON object with these fields:

1. **title**: A concise, encouraging title for this week's reflection (max 60 characters). Example: "A week of focused growth" or "Balancing priorities"

2. **insights**: 2-4 paragraphs of reflection insights (max 1000 characters). Include:
   - What went well this week
   - Patterns observed (peak times, high-fulfillment activities)
   - How the user's time usage connects to their core values
   - If there's a gap between stated values and actual time allocation, gently point it out as a question, not a judgment
   - One specific, actionable suggestion for next week

3. **question**: A thought-provoking question to help the user reflect deeper (max 200 characters). This should be personal and based on the data.

4. **activities**: An array of the top 3-5 tag categories by time spent, each with:
   - "label": the tag name
   - "minutes": total minutes spent
   - "highlight": a brief observation about this category (max 80 characters)

Respond ONLY with the JSON object. No markdown code blocks, no explanation.`);

  return sections.join('\n\n');
}
