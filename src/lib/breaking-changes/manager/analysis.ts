/**
 * 影響分析ユーティリティ
 */

import type { AffectedGroup, BreakingChange, ChangeImpactAnalysis, ImpactLevel } from '../types';

/**
 * 📊 グループ固有の影響度計算
 */
export function calculateGroupSpecificImpact(
  change: BreakingChange,
  group: AffectedGroup,
): ImpactLevel {
  // グループごとの影響度調整ロジック
  if (group === 'end_users' && change.type === 'api_change') {
    return 'low'; // エンドユーザーはAPI変更の影響は間接的
  }
  if (group === 'api_consumers' && change.type === 'api_change') {
    return 'critical'; // API利用者は直接的な影響
  }
  return change.impact;
}

/**
 * 📋 グループ固有の詳細取得
 */
export function getGroupSpecificDetails(_change: BreakingChange, group: AffectedGroup): string[] {
  const details: string[] = [];

  switch (group) {
    case 'developers':
      details.push('コード修正が必要');
      details.push('ビルド・テストの確認が必要');
      break;
    case 'devops':
      details.push('デプロイメント設定の更新が必要');
      details.push('監視・アラート設定の見直しが必要');
      break;
    case 'api_consumers':
      details.push('API呼び出し方法の変更が必要');
      details.push('レスポンス処理の更新が必要');
      break;
  }

  return details;
}

/**
 * 🛡️ グループ固有の軽減策取得
 */
export function getGroupSpecificMitigation(
  change: BreakingChange,
  _group: AffectedGroup,
): string[] {
  return change.workaround?.steps || [];
}

/**
 * ⚠️ リスクレベル計算
 */
export function calculateRiskLevel(change: BreakingChange): 'low' | 'medium' | 'high' {
  const impactWeight = { low: 1, medium: 2, high: 3, critical: 4 }[change.impact];
  const groupsCount = change.affectedGroups.length;

  if (impactWeight >= 3 || groupsCount >= 4) return 'high';
  if (impactWeight >= 2 || groupsCount >= 2) return 'medium';
  return 'low';
}

/**
 * 🎯 リスク特定
 */
export function identifyRisks(change: BreakingChange): string[] {
  const risks: string[] = [];

  if (change.impact === 'critical') {
    risks.push('サービス停止の可能性');
  }
  if (change.affectedGroups.includes('end_users')) {
    risks.push('ユーザーエクスペリエンスの低下');
  }
  if (!change.migration.automatable) {
    risks.push('手動作業によるヒューマンエラー');
  }

  return risks;
}

/**
 * 🛡️ リスク軽減策提案
 */
export function suggestRiskMitigation(_change: BreakingChange): string[] {
  return [
    '段階的ロールアウトの実施',
    'バックアップとロールバック計画の準備',
    '十分なテスト期間の確保',
  ];
}

/**
 * 📅 アクション優先度計算
 */
export function calculateActionPriority(change: BreakingChange): 'low' | 'medium' | 'high' {
  return change.impact === 'critical' ? 'high' : change.impact === 'high' ? 'medium' : 'low';
}

/**
 * 💡 推奨アクション生成
 */
export function generateRecommendedActions(change: BreakingChange): string[] {
  const actions: string[] = [];

  actions.push(`${change.title}のマイグレーション計画を作成`);
  actions.push('影響範囲の詳細分析を実施');

  if (change.migration.required) {
    actions.push('必須マイグレーション作業をスケジュール');
  }

  return actions;
}

/**
 * 📅 期限計算
 */
export function calculateDeadline(change: BreakingChange): string {
  const releaseDate = new Date(change.releaseDate);
  const deadline = new Date(releaseDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30日後
  return deadline.toISOString().split('T')[0]!;
}

/**
 * 🎯 変更影響分析
 */
export function analyzeChangeImpact(change: BreakingChange): ChangeImpactAnalysis {
  // 影響評価の生成
  const groupImpacts: Record<
    AffectedGroup,
    {
      impact: ImpactLevel;
      details: string[];
      mitigation?: string[];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 動的に構築されるRecord
  > = {} as any;

  change.affectedGroups.forEach((group) => {
    groupImpacts[group] = {
      impact: calculateGroupSpecificImpact(change, group),
      details: getGroupSpecificDetails(change, group),
      mitigation: getGroupSpecificMitigation(change, group),
    };
  });

  // リスク評価
  const riskLevel = calculateRiskLevel(change);
  const risks = identifyRisks(change);
  const mitigation = suggestRiskMitigation(change);

  // 推奨アクション
  const priority = calculateActionPriority(change);
  const actions = generateRecommendedActions(change);

  return {
    change,
    assessment: {
      overallImpact: change.impact,
      groupImpacts,
    },
    risks: {
      level: riskLevel,
      details: risks,
      mitigation,
    },
    recommendations: {
      priority,
      actions,
      deadline: calculateDeadline(change),
    },
  };
}
