/**
 * Plans Service Types
 *
 * サービス層で使用する型定義
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import type { CreatePlanInput, PlanFilter, UpdatePlanInput } from '@/schemas/plans';

/**
 * サービス関数で使用するSupabaseクライアント型
 */
export type ServiceSupabaseClient = SupabaseClient<Database>;

/**
 * プランのデータベース行型
 */
export type PlanRow = Database['public']['Tables']['plans']['Row'];

/**
 * プランタグのデータベース行型
 */
export type PlanTagRow = Database['public']['Tables']['plan_tags']['Row'];

/**
 * タグのデータベース行型
 */
export type TagRow = Database['public']['Tables']['tags']['Row'];

/**
 * プラン（タグID付き）
 *
 * タグの詳細情報（name, color等）はtags.listキャッシュから取得する。
 * これにより、タグマスタの変更が全UIで即時反映される。
 */
export interface PlanWithTags extends PlanRow {
  plan_tags?: Array<{
    tag_id: string;
  }>;
  tagIds?: string[];
}

/**
 * プラン一覧取得のオプション
 */
export interface ListPlansOptions extends PlanFilter {
  userId: string;
}

/**
 * プラン作成のオプション
 */
export interface CreatePlanOptions {
  userId: string;
  input: CreatePlanInput;
  /** 重複防止設定（ONの場合、時間重複をブロック） */
  preventOverlappingPlans?: boolean;
}

/**
 * プラン更新のオプション
 */
export interface UpdatePlanOptions {
  userId: string;
  planId: string;
  input: UpdatePlanInput;
  /** 重複防止設定（ONの場合、時間重複をブロック） */
  preventOverlappingPlans?: boolean;
}

/**
 * プラン削除のオプション
 */
export interface DeletePlanOptions {
  userId: string;
  planId: string;
}

/**
 * プラン取得のオプション
 */
export interface GetPlanByIdOptions {
  userId: string;
  planId: string;
  includeTags?: boolean;
}
