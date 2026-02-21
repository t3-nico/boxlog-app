// テンプレートシステムの型定義

/** プランテンプレート */
export interface PlanTemplate {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  title_pattern: string;
  plan_description: string | null;
  duration_minutes: number | null;
  reminder_minutes: number | null;
  use_count: number;
  tag_ids: string[];
  created_at: string;
  updated_at: string;
}

/** テンプレート作成入力 */
export interface CreateTemplateInput {
  name: string;
  description?: string | null | undefined;
  title_pattern: string;
  plan_description?: string | null | undefined;
  duration_minutes?: number | null | undefined;
  reminder_minutes?: number | null | undefined;
  tag_ids?: string[] | undefined;
}

/** テンプレート更新入力 */
export interface UpdateTemplateInput {
  name?: string | undefined;
  description?: string | null | undefined;
  title_pattern?: string | undefined;
  plan_description?: string | null | undefined;
  duration_minutes?: number | null | undefined;
  reminder_minutes?: number | null | undefined;
  tag_ids?: string[] | undefined;
}

/** テンプレート一覧レスポンス */
export interface TemplatesResponse {
  data: PlanTemplate[];
  count: number;
}
