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
  color: string; // Tailwind color class or hex
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
      { startHour: 6, endHour: 8, level: 'good', label: '準備時間', color: 'bg-yellow-300' },
      { startHour: 8, endHour: 12, level: 'peak', label: 'ピーク', color: 'bg-green-500' },
      { startHour: 12, endHour: 14, level: 'good', label: '集中時間', color: 'bg-green-300' },
      { startHour: 14, endHour: 18, level: 'moderate', label: '通常', color: 'bg-blue-200' },
      { startHour: 18, endHour: 22, level: 'low', label: '低調', color: 'bg-gray-200' },
      { startHour: 22, endHour: 6, level: 'sleep', label: '睡眠', color: 'bg-indigo-500' },
    ],
  },

  bear: {
    type: 'bear',
    name: 'Bear',
    description:
      '太陽のリズムに沿った生活が自然にできる標準型。7時頃に起床し、午前中から午後前半にかけて生産性が高まる。9-5の生活スタイルに最も適応しやすい。人口の約55%。',
    productivityZones: [
      { startHour: 7, endHour: 10, level: 'moderate', label: '準備時間', color: 'bg-yellow-200' },
      { startHour: 10, endHour: 14, level: 'peak', label: 'ピーク', color: 'bg-green-500' },
      { startHour: 14, endHour: 16, level: 'low', label: '低調', color: 'bg-gray-200' },
      { startHour: 16, endHour: 21, level: 'moderate', label: '通常', color: 'bg-blue-200' },
      { startHour: 21, endHour: 23, level: 'low', label: '就寝準備', color: 'bg-gray-200' },
      { startHour: 23, endHour: 7, level: 'sleep', label: '睡眠', color: 'bg-indigo-500' },
    ],
  },

  wolf: {
    type: 'wolf',
    name: 'Wolf',
    description:
      '午前中は苦手で、夕方から夜にかけてエンジンがかかる夜型。深夜まで眠くならず、クリエイティブで感情豊か。アーティストやミュージシャンに多い。人口の約15%。',
    productivityZones: [
      { startHour: 9, endHour: 12, level: 'low', label: '低調', color: 'bg-gray-200' },
      { startHour: 12, endHour: 14, level: 'moderate', label: '準備時間', color: 'bg-yellow-200' },
      { startHour: 14, endHour: 17, level: 'good', label: '集中時間', color: 'bg-green-300' },
      { startHour: 17, endHour: 20, level: 'peak', label: 'ピーク', color: 'bg-green-500' },
      { startHour: 20, endHour: 24, level: 'good', label: '創造時間', color: 'bg-purple-300' },
      { startHour: 0, endHour: 9, level: 'sleep', label: '睡眠', color: 'bg-indigo-500' },
    ],
  },

  dolphin: {
    type: 'dolphin',
    name: 'Dolphin',
    description:
      '睡眠が浅く不規則なパターンを持つ。午前中に集中力がピークを迎え、午後は低調になりやすい。知能が高く、慎重で完璧主義な傾向。人口の約10%。',
    productivityZones: [
      { startHour: 6, endHour: 8, level: 'moderate', label: '起床', color: 'bg-blue-200' },
      { startHour: 8, endHour: 11, level: 'peak', label: 'ピーク', color: 'bg-green-500' },
      { startHour: 11, endHour: 14, level: 'good', label: '創造時間', color: 'bg-green-300' },
      { startHour: 14, endHour: 17, level: 'low', label: '低調', color: 'bg-gray-200' },
      { startHour: 17, endHour: 22, level: 'moderate', label: '通常', color: 'bg-blue-200' },
      { startHour: 22, endHour: 6, level: 'sleep', label: '睡眠', color: 'bg-indigo-500' },
    ],
  },

  custom: {
    type: 'custom',
    name: 'Custom',
    description: '自分だけのリズムを設定できます',
    productivityZones: [],
  },
};

// 色のマッピング (より鮮明で目立つ色に変更)
export const PRODUCTIVITY_COLORS = {
  'bg-green-500': { bg: 'rgb(34 197 94)', border: 'rgb(22 163 74)' }, // Peak - 濃い緑
  'bg-green-300': { bg: 'rgb(134 239 172)', border: 'rgb(34 197 94)' }, // Good - 緑
  'bg-blue-200': { bg: 'rgb(191 219 254)', border: 'rgb(59 130 246)' }, // Moderate - 青
  'bg-yellow-300': { bg: 'rgb(253 224 71)', border: 'rgb(245 158 11)' }, // 準備時間 - 黄色
  'bg-yellow-200': { bg: 'rgb(254 240 138)', border: 'rgb(245 158 11)' }, // 起床時間 - 薄い黄色
  'bg-purple-300': { bg: 'rgb(196 181 253)', border: 'rgb(147 51 234)' }, // 創造時間 - 紫
  'bg-gray-200': { bg: 'rgb(229 231 235)', border: 'rgb(107 114 128)' }, // Low - グレー
  'bg-gray-300': { bg: 'rgb(209 213 219)', border: 'rgb(107 114 128)' }, // 睡眠試行 - グレー
  'bg-gray-400': { bg: 'rgb(156 163 175)', border: 'rgb(75 85 99)' }, // 睡眠推奨 - 濃いグレー
  'bg-indigo-500': { bg: 'rgb(99 102 241)', border: 'rgb(67 56 202)' }, // Sleep - インディゴ
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
  switch (level) {
    case 'peak':
      return 'bg-green-500';
    case 'good':
      return 'bg-green-300';
    case 'moderate':
      return 'bg-blue-200';
    case 'low':
      return 'bg-gray-200';
    case 'sleep':
      return 'bg-indigo-500';
    default:
      return 'bg-gray-200';
  }
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
