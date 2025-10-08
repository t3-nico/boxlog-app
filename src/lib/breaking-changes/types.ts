/**
 * 🚨 Breaking Changes Types
 *
 * 破壊的変更管理システムの型定義
 * - 変更記録・影響範囲・マイグレーション情報
 */

/**
 * 🎯 破壊的変更の種類
 */
export type BreakingChangeType =
  | 'api_change' // API変更（エンドポイント・レスポンス）
  | 'config_change' // 設定ファイル変更
  | 'database_change' // データベーススキーマ変更
  | 'dependency_change' // 依存関係変更
  | 'interface_change' // UI/UX変更
  | 'auth_change' // 認証方式変更
  | 'behavior_change' // 動作仕様変更
  | 'removal' // 機能削除

/**
 * 📊 影響度レベル
 */
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical'

/**
 * 👥 影響対象グループ
 */
export type AffectedGroup =
  | 'end_users' // エンドユーザー
  | 'developers' // 開発者
  | 'api_consumers' // API利用者
  | 'devops' // DevOps・運用担当
  | 'administrators' // システム管理者
  | 'external_systems' // 外部システム連携

/**
 * 🚨 破壊的変更エントリ
 */
export interface BreakingChange {
  /** 一意識別子 */
  id: string
  /** バージョン */
  version: string
  /** リリース日 */
  releaseDate: string
  /** 変更タイトル */
  title: string
  /** 変更の詳細説明 */
  description: string
  /** 変更の種類 */
  type: BreakingChangeType
  /** 影響度 */
  impact: ImpactLevel
  /** 影響対象グループ */
  affectedGroups: AffectedGroup[]
  /** 変更理由 */
  reason: string
  /** マイグレーション情報 */
  migration: {
    /** 必要性（true: 必須, false: 推奨） */
    required: boolean
    /** 推定作業時間（分） */
    estimatedTime?: number
    /** マイグレーション手順 */
    steps: MigrationStep[]
    /** 自動化可能性 */
    automatable: boolean
    /** 自動化スクリプト */
    automationScript?: string
  }
  /** 回避方法（可能な場合） */
  workaround?: {
    /** 回避方法の説明 */
    description: string
    /** 回避方法の手順 */
    steps: string[]
    /** 制限事項 */
    limitations?: string[]
  }
  /** 関連リンク */
  references?: {
    /** ドキュメント */
    documentation?: string[]
    /** GitHub Issue */
    issues?: string[]
    /** Pull Request */
    pullRequests?: string[]
    /** 外部リソース */
    external?: string[]
  }
  /** 検証方法 */
  validation?: {
    /** 検証手順 */
    steps: string[]
    /** 期待結果 */
    expectedResults: string[]
    /** テストコマンド */
    testCommands?: string[]
  }
  /** メタデータ */
  metadata: {
    /** 作成者 */
    author: string
    /** 作成日 */
    createdAt: string
    /** 最終更新日 */
    updatedAt: string
    /** レビュー担当者 */
    reviewedBy?: string[]
    /** 承認日 */
    approvedAt?: string
  }
}

/**
 * 🔄 マイグレーション手順
 */
export interface MigrationStep {
  /** 手順番号 */
  order: number
  /** 手順タイトル */
  title: string
  /** 詳細説明 */
  description: string
  /** 実行コマンド */
  command?: string
  /** 期待結果 */
  expectedResult?: string
  /** 注意事項 */
  warnings?: string[]
  /** 必須フラグ */
  required: boolean
  /** 推定時間（分） */
  estimatedTime?: number
}

/**
 * 📋 破壊的変更サマリー
 */
export interface BreakingChangeSummary {
  /** バージョン */
  version: string
  /** リリース日 */
  releaseDate: string
  /** 変更総数 */
  totalChanges: number
  /** 影響度別統計 */
  byImpact: Record<ImpactLevel, number>
  /** 種類別統計 */
  byType: Record<BreakingChangeType, number>
  /** 対象グループ別統計 */
  byAffectedGroup: Record<AffectedGroup, number>
  /** 必須マイグレーション数 */
  requiredMigrations: number
  /** 推定総作業時間（分） */
  totalMigrationTime: number
}

/**
 * 🔍 破壊的変更検索条件
 */
export interface BreakingChangeQuery {
  /** バージョン範囲 */
  versionRange?: {
    from?: string
    to?: string
  }
  /** 日付範囲 */
  dateRange?: {
    from?: Date
    to?: Date
  }
  /** 変更タイプ */
  types?: BreakingChangeType[]
  /** 影響度 */
  impacts?: ImpactLevel[]
  /** 対象グループ */
  affectedGroups?: AffectedGroup[]
  /** キーワード検索 */
  keywords?: string[]
  /** マイグレーション必須のみ */
  requiresMigration?: boolean
}

/**
 * 📊 互換性マトリクス
 */
export interface CompatibilityMatrix {
  /** 現在のバージョン */
  currentVersion: string
  /** サポート対象バージョン */
  supportedVersions: string[]
  /** 非推奨バージョン */
  deprecatedVersions: VersionDeprecation[]
  /** サポート終了バージョン */
  unsupportedVersions: string[]
  /** バージョン間互換性 */
  compatibility: VersionCompatibility[]
}

/**
 * ⚠️ バージョン非推奨情報
 */
export interface VersionDeprecation {
  /** バージョン */
  version: string
  /** 非推奨開始日 */
  deprecatedSince: string
  /** サポート終了予定日 */
  endOfLifeDate: string
  /** 非推奨理由 */
  reason: string
  /** 推奨移行先 */
  recommendedVersion: string
}

/**
 * 🔗 バージョン互換性
 */
export interface VersionCompatibility {
  /** 元バージョン */
  fromVersion: string
  /** 対象バージョン */
  toVersion: string
  /** 互換性レベル */
  level: 'full' | 'partial' | 'breaking' | 'none'
  /** 破壊的変更リスト */
  breakingChanges: string[]
  /** 自動マイグレーション可能 */
  autoMigratable: boolean
}

/**
 * 🚨 変更影響分析
 */
export interface ChangeImpactAnalysis {
  /** 分析対象変更 */
  change: BreakingChange
  /** 影響評価 */
  assessment: {
    /** 総合影響度 */
    overallImpact: ImpactLevel
    /** グループ別影響詳細 */
    groupImpacts: Record<
      AffectedGroup,
      {
        impact: ImpactLevel
        details: string[]
        mitigation?: string[]
      }
    >
  }
  /** リスク評価 */
  risks: {
    /** リスクレベル */
    level: 'low' | 'medium' | 'high'
    /** 具体的リスク */
    details: string[]
    /** 軽減策 */
    mitigation: string[]
  }
  /** 推奨アクション */
  recommendations: {
    /** 実施推奨度 */
    priority: 'low' | 'medium' | 'high'
    /** 推奨アクション */
    actions: string[]
    /** 実施期限 */
    deadline?: string
  }
}

/**
 * 📢 変更通知設定
 */
export interface ChangeNotificationConfig {
  /** 通知有効化 */
  enabled: boolean
  /** 通知対象の影響度 */
  impactThreshold: ImpactLevel
  /** 通知チャンネル */
  channels: {
    /** メール通知 */
    email?: {
      enabled: boolean
      recipients: string[]
      template: string
    }
    /** Slack通知 */
    slack?: {
      enabled: boolean
      webhook: string
      channel: string
      mentionUsers?: string[]
    }
    /** GitHub Issue自動作成 */
    github?: {
      enabled: boolean
      repository: string
      labels: string[]
      assignees?: string[]
    }
  }
  /** 事前通知期間（日） */
  advanceNotice: number
}

/**
 * 📋 マイグレーション計画
 */
export interface MigrationPlan {
  /** 計画ID */
  id: string
  /** 対象変更 */
  changes: BreakingChange[]
  /** 実施スケジュール */
  schedule: {
    /** 開始予定日 */
    startDate: string
    /** 完了予定日 */
    endDate: string
    /** フェーズ分け */
    phases?: MigrationPhase[]
  }
  /** 担当者 */
  assignees: string[]
  /** ステータス */
  status: 'planned' | 'in_progress' | 'completed' | 'failed'
  /** 進捗率 */
  progress: number
  /** チェックリスト */
  checklist: {
    item: string
    completed: boolean
    assignee?: string
    dueDate?: string
  }[]
}

/**
 * 🔄 マイグレーションフェーズ
 */
export interface MigrationPhase {
  /** フェーズ番号 */
  phase: number
  /** フェーズ名 */
  name: string
  /** 説明 */
  description: string
  /** 対象変更 */
  changes: string[]
  /** 開始日 */
  startDate: string
  /** 終了日 */
  endDate: string
  /** 前提条件 */
  prerequisites?: string[]
  /** 成功条件 */
  successCriteria: string[]
}
