'use client';

import { AIStyleSettings } from './ai-style-settings';
import { ChronotypeSettings } from './chronotype-settings';
import { ValueRankingSettings } from './value-ranking-settings';
import { ValuesSettings } from './values-settings';

/**
 * パーソナライゼーション設定ページ
 *
 * 4つのセクションをまとめて表示:
 * 1. 価値評定スケール（12領域 × 重要度）
 * 2. 価値観キーワードランキング（トップ10）
 * 3. AIコミュニケーションスタイル
 * 4. クロノタイプ設定
 */
export function PersonalizationPage() {
  return (
    <div className="space-y-8">
      <ValuesSettings />
      <ValueRankingSettings />
      <AIStyleSettings />
      <ChronotypeSettings />
    </div>
  );
}
