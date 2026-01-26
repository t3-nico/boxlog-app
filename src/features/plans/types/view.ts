/**
 * Plan View Type Definitions
 *
 * ユーザーがカスタマイズ可能なView（表示設定）の型定義
 */

/**
 * Plan View Configuration
 *
 * ユーザーが保存できるView設定（フィルタ条件のみ）
 *
 * @example
 * ```typescript
 * const myView: PlanView = {
 *   id: 'view-1',
 *   name: '高優先度タスク',
 *   filters: {
 *     priority: ['high', 'urgent'],
 *     status: ['open', 'in_progress']
 *   },
 *   isDefault: false,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * }
 * ```
 */
export type PlanView = {
  /** View ID (UUID) */
  id: string;

  /** View名（ユーザーが設定） */
  name: string;

  /** フィルター設定 */
  filters: {
    /** ステータスフィルター */
    status?: string[] | undefined;
    /** 優先度フィルター */
    priority?: string[] | undefined;
    /** タグフィルター */
    tags?: string[] | undefined;
    /** 検索キーワード */
    search?: string | undefined;
    /** アーカイブ済みかどうか */
    archived?: boolean | undefined;
  };

  /** ソート設定（将来拡張用） */
  sorting?:
    | {
        field: string;
        direction: 'asc' | 'desc';
      }
    | undefined;

  /** Table view専用: 列設定 */
  columns?:
    | Array<{
        id: string;
        visible: boolean;
        width: number;
      }>
    | undefined;

  /** Table view専用: ページサイズ */
  pageSize?: number | undefined;

  /** デフォルトViewかどうか */
  isDefault?: boolean | undefined;

  /** 作成日時 */
  createdAt: Date;

  /** 更新日時 */
  updatedAt: Date;
};

/**
 * View作成用の入力データ
 */
export type CreatePlanViewInput = {
  name: string;
  filters?: PlanView['filters'] | undefined;
  sorting?: PlanView['sorting'] | undefined;
  isDefault?: boolean | undefined;
};

/**
 * View更新用の入力データ
 */
export type UpdatePlanViewInput = Partial<Omit<PlanView, 'id' | 'createdAt' | 'updatedAt'>>;
