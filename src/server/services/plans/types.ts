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
 * プラン（タグ付き）
 */
export interface PlanWithTags extends PlanRow {
  plan_tags?: Array<{
    tag_id: string;
    tags: TagRow | null;
  }>;
  tags?: TagRow[];
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

/**
 * サービス関数の結果型
 */
export interface ServiceResult<T> {
  data: T;
  error: null;
}

/**
 * サービス関数のエラー型
 */
export interface ServiceError {
  data: null;
  error: {
    code: string;
    message: string;
  };
}

/**
 * サービス関数の戻り値型
 */
export type ServiceResponse<T> = ServiceResult<T> | ServiceError;

/**
 * RPC関数の型定義
 * これらのRPC関数はDBマイグレーションで作成が必要
 */
export interface PlanRpcFunctions {
  create_plan_with_tags: {
    Args: {
      p_user_id: string;
      p_title: string;
      p_description: string | null;
      p_scheduled_date: string | null;
      p_tag_ids: string[];
    };
    Returns: {
      id: string;
      user_id: string;
      title: string;
      description: string | null;
      scheduled_date: string | null;
      created_at: string;
      updated_at: string;
      tag_ids: string[];
    };
  };
  update_plan_with_tags: {
    Args: {
      p_user_id: string;
      p_plan_id: string;
      p_title: string | null;
      p_description: string | null;
      p_scheduled_date: string | null;
      p_tag_ids: string[] | null;
    };
    Returns: {
      id: string;
      user_id: string;
      title: string;
      description: string | null;
      scheduled_date: string | null;
      created_at: string;
      updated_at: string;
      tag_ids: string[] | null;
    };
  };
  delete_plan_with_cleanup: {
    Args: {
      p_user_id: string;
      p_plan_id: string;
    };
    Returns: {
      success: boolean;
      deleted_plan_id: string;
    };
  };
}

/**
 * 型安全なRPC呼び出しヘルパー
 * 注意: RPC関数がDBに存在しない場合、ランタイムエラーになります
 * TODO: DBマイグレーションでRPC関数を作成後、database.types.tsを再生成してこのヘルパーを削除
 */
export function callPlanRpc<T extends keyof PlanRpcFunctions>(
  supabase: ServiceSupabaseClient,
  functionName: T,
  args: PlanRpcFunctions[T]['Args'],
): Promise<{ data: PlanRpcFunctions[T]['Returns'] | null; error: Error | null }> {
  // DBの型定義にRPC関数が存在しないため、unknownを経由してキャスト
  const rpcCall = supabase.rpc as unknown as (
    fn: string,
    params: Record<string, unknown>,
  ) => Promise<{ data: PlanRpcFunctions[T]['Returns'] | null; error: Error | null }>;
  return rpcCall(functionName, args as Record<string, unknown>);
}
