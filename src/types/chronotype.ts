export type ChronotypeType = 'lion' | 'bear' | 'wolf' | 'dolphin' | 'custom';

export interface ChronotypeProfile {
  type: ChronotypeType;
  name: string;
  description: string;
  productivityZones: ProductivityZone[];
}

export interface ProductivityZone {
  startHour: number; // 0-23
  endHour: number; // 0-23
  level: 'peak' | 'good' | 'moderate' | 'low' | 'sleep';
  label: string;
}

// プリセットのクロノタイプ定義
// 参考: Dr. Michael Breus "The Power of When" (https://sleepdoctor.com/pages/chronotypes)
export const CHRONOTYPE_PRESETS: Record<ChronotypeType, ChronotypeProfile> = {
  lion: {
    type: 'lion',
    name: 'Lion',
    description:
      '目覚まし不要で早朝に自然と起きる超朝型。午前中にエネルギーがピークを迎え、夕方以降は早めに眠くなる。楽観的で規律正しく、目標志向。人口の約15-20%。',
    productivityZones: [
      { startHour: 6, endHour: 8, level: 'good', label: '準備時間' },
      { startHour: 8, endHour: 12, level: 'peak', label: 'ピーク' },
      { startHour: 12, endHour: 14, level: 'good', label: '集中時間' },
      { startHour: 14, endHour: 18, level: 'moderate', label: '通常' },
      { startHour: 18, endHour: 22, level: 'low', label: '低調' },
      { startHour: 22, endHour: 6, level: 'sleep', label: '睡眠' },
    ],
  },

  bear: {
    type: 'bear',
    name: 'Bear',
    description:
      '太陽のリズムに沿った生活が自然にできる標準型。7時頃に起床し、午前中から午後前半にかけて生産性が高まる。9-5の生活スタイルに最も適応しやすい。人口の約55%。',
    productivityZones: [
      { startHour: 7, endHour: 10, level: 'moderate', label: '準備時間' },
      { startHour: 10, endHour: 14, level: 'peak', label: 'ピーク' },
      { startHour: 14, endHour: 16, level: 'low', label: '低調' },
      { startHour: 16, endHour: 21, level: 'moderate', label: '通常' },
      { startHour: 21, endHour: 23, level: 'low', label: '就寝準備' },
      { startHour: 23, endHour: 7, level: 'sleep', label: '睡眠' },
    ],
  },

  wolf: {
    type: 'wolf',
    name: 'Wolf',
    description:
      '午前中は苦手で、夕方から夜にかけてエンジンがかかる夜型。深夜まで眠くならず、クリエイティブで感情豊か。アーティストやミュージシャンに多い。人口の約15%。',
    productivityZones: [
      { startHour: 9, endHour: 12, level: 'low', label: '低調' },
      { startHour: 12, endHour: 14, level: 'moderate', label: '準備時間' },
      { startHour: 14, endHour: 17, level: 'good', label: '集中時間' },
      { startHour: 17, endHour: 20, level: 'peak', label: 'ピーク' },
      { startHour: 20, endHour: 24, level: 'good', label: '創造時間' },
      { startHour: 0, endHour: 9, level: 'sleep', label: '睡眠' },
    ],
  },

  dolphin: {
    type: 'dolphin',
    name: 'Dolphin',
    description:
      '睡眠が浅く不規則なパターンを持つ。午前中に集中力がピークを迎え、午後は低調になりやすい。知能が高く、慎重で完璧主義な傾向。人口の約10%。',
    productivityZones: [
      { startHour: 6, endHour: 8, level: 'moderate', label: '起床' },
      { startHour: 8, endHour: 11, level: 'peak', label: 'ピーク' },
      { startHour: 11, endHour: 14, level: 'good', label: '創造時間' },
      { startHour: 14, endHour: 17, level: 'low', label: '低調' },
      { startHour: 17, endHour: 22, level: 'moderate', label: '通常' },
      { startHour: 22, endHour: 6, level: 'sleep', label: '睡眠' },
    ],
  },

  custom: {
    type: 'custom',
    name: 'Custom',
    description: '自分だけのリズムを設定できます',
    productivityZones: [],
  },
};

/**
 * 生産性レベルに対応するセマンティックカラークラス
 * globals.css で定義された --chronotype-* CSS変数を使用
 */
export const LEVEL_COLORS: Record<ProductivityZone['level'], string> = {
  peak: 'bg-[var(--chronotype-peak)]',
  good: 'bg-[var(--chronotype-good)]',
  moderate: 'bg-[var(--chronotype-moderate)]',
  low: 'bg-[var(--chronotype-low)]',
  sleep: 'bg-[var(--chronotype-sleep)]',
};

// ヘルパー関数
export function getProductivityZoneForHour(
  profile: ChronotypeProfile,
  hour: number,
): ProductivityZone | null {
  return (
    profile.productivityZones.find((zone) => {
      if (zone.startHour <= zone.endHour) {
        // 同日内の時間帯 (e.g. 9-17)
        return hour >= zone.startHour && hour < zone.endHour;
      } else {
        // 日跨ぎの時間帯 (e.g. 22-5)
        return hour >= zone.startHour || hour < zone.endHour;
      }
    }) || null
  );
}

export function getProductivityLevelColor(level: ProductivityZone['level']): string {
  return LEVEL_COLORS[level] ?? LEVEL_COLORS.low;
}

// セマンティックトークン（CSS変数）によるクロノタイプカラー
export const CHRONOTYPE_LEVEL_COLORS: Record<ProductivityZone['level'], string> = {
  peak: 'var(--chronotype-peak)',
  good: 'var(--chronotype-good)',
  moderate: 'var(--chronotype-moderate)',
  low: 'var(--chronotype-low)',
  sleep: 'var(--chronotype-sleep)',
};

// levelからCSS変数値を取得
export function getChronotypeColor(level: ProductivityZone['level']): string {
  return CHRONOTYPE_LEVEL_COLORS[level];
}
