/**
 * パーソナライゼーション設定の型定義
 *
 * 「最高の体調」（鈴木祐）のACT価値評定スケール（Kelly Wilson）に基づく
 * 12カテゴリ + 重要度(1-10)
 */

/** 価値観の12カテゴリ（ACT価値評定スケール） */
export type PersonalizationCategory =
  | 'family'
  | 'romance'
  | 'parenting'
  | 'friends'
  | 'career'
  | 'selfGrowth'
  | 'leisure'
  | 'spirituality'
  | 'community'
  | 'health'
  | 'environment'
  | 'art';

/** カテゴリごとの価値観 */
export interface PersonalizationValue {
  /** ユーザーが記入した価値観テキスト */
  text: string;
  /** 重要度 (1-10) */
  importance: number;
}

/** 全カテゴリの価値観マップ */
export type PersonalizationValues = Partial<Record<PersonalizationCategory, PersonalizationValue>>;

/** AIコミュニケーションスタイル */
export type AICommunicationStyle = 'coach' | 'analyst' | 'friendly' | 'custom';

/** カテゴリの順序定義 */
export const PERSONALIZATION_CATEGORIES: PersonalizationCategory[] = [
  'family',
  'romance',
  'parenting',
  'friends',
  'career',
  'selfGrowth',
  'leisure',
  'spirituality',
  'community',
  'health',
  'environment',
  'art',
];

/** AIスタイルの選択肢 */
export const AI_COMMUNICATION_STYLES: AICommunicationStyle[] = [
  'coach',
  'analyst',
  'friendly',
  'custom',
];

/** 価値観キーワード（ACTベース、約50個） */
export type ValueKeyword =
  | 'integrity'
  | 'courage'
  | 'curiosity'
  | 'compassion'
  | 'creativity'
  | 'gratitude'
  | 'freedom'
  | 'fairness'
  | 'perseverance'
  | 'humor'
  | 'honesty'
  | 'independence'
  | 'kindness'
  | 'leadership'
  | 'learning'
  | 'love'
  | 'loyalty'
  | 'humility'
  | 'adventure'
  | 'stability'
  | 'trust'
  | 'wisdom'
  | 'beauty'
  | 'cooperation'
  | 'discipline'
  | 'empathy'
  | 'tolerance'
  | 'wellbeing'
  | 'hope'
  | 'justice'
  | 'peace'
  | 'joy'
  | 'responsibility'
  | 'respect'
  | 'safety'
  | 'service'
  | 'simplicity'
  | 'achievement'
  | 'teamwork'
  | 'tradition'
  | 'diversity'
  | 'environmentalism'
  | 'connection'
  | 'growth'
  | 'passion'
  | 'playfulness'
  | 'balance'
  | 'challenge'
  | 'contribution'
  | 'authenticity';

/** 全キーワードの順序定義 */
export const VALUE_KEYWORDS: ValueKeyword[] = [
  'integrity',
  'courage',
  'curiosity',
  'compassion',
  'creativity',
  'gratitude',
  'freedom',
  'fairness',
  'perseverance',
  'humor',
  'honesty',
  'independence',
  'kindness',
  'leadership',
  'learning',
  'love',
  'loyalty',
  'humility',
  'adventure',
  'stability',
  'trust',
  'wisdom',
  'beauty',
  'cooperation',
  'discipline',
  'empathy',
  'tolerance',
  'wellbeing',
  'hope',
  'justice',
  'peace',
  'joy',
  'responsibility',
  'respect',
  'safety',
  'service',
  'simplicity',
  'achievement',
  'teamwork',
  'tradition',
  'diversity',
  'environmentalism',
  'connection',
  'growth',
  'passion',
  'playfulness',
  'balance',
  'challenge',
  'contribution',
  'authenticity',
];

/** ランキングの最大数 */
export const MAX_RANKED_VALUES = 10;
