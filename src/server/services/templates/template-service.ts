/**
 * Template Service
 *
 * プランテンプレートのCRUD操作のビジネスロジック層
 *
 * 主な機能:
 * - テンプレート一覧取得（使用回数順ソート対応）
 * - テンプレート作成（タグ付き）
 * - テンプレート更新（タグ含む）
 * - テンプレート削除
 * - 使用回数インクリメント
 *
 * tag-service.ts のパターンを踏襲
 */

import type { PlanTemplate } from '@/features/templates/types';
import type { Database } from '@/lib/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

/** DB テンプレート行の型 */
type DbTemplateRow = Database['public']['Tables']['plan_templates']['Row'];

/**
 * DBのテンプレート行をフロントエンド用の PlanTemplate 型に変換
 */
function transformDbTemplate(dbTemplate: DbTemplateRow, tagIds: string[]): PlanTemplate {
  return {
    id: dbTemplate.id,
    user_id: dbTemplate.user_id,
    name: dbTemplate.name,
    description: dbTemplate.description,
    title_pattern: dbTemplate.title_pattern,
    plan_description: dbTemplate.plan_description,
    duration_minutes: dbTemplate.duration_minutes,
    reminder_minutes: dbTemplate.reminder_minutes,
    use_count: dbTemplate.use_count,
    tag_ids: tagIds,
    created_at: dbTemplate.created_at,
    updated_at: dbTemplate.updated_at,
  };
}

/** テンプレート作成入力 */
export interface CreateTemplateServiceInput {
  name: string;
  description?: string | null | undefined;
  title_pattern: string;
  plan_description?: string | null | undefined;
  duration_minutes?: number | null | undefined;
  reminder_minutes?: number | null | undefined;
  tag_ids?: string[] | undefined;
}

/** テンプレート更新入力 */
export interface UpdateTemplateServiceInput {
  name?: string | undefined;
  description?: string | null | undefined;
  title_pattern?: string | undefined;
  plan_description?: string | null | undefined;
  duration_minutes?: number | null | undefined;
  reminder_minutes?: number | null | undefined;
  tag_ids?: string[] | undefined;
}

/**
 * Template Service エラー
 */
export class TemplateServiceError extends Error {
  constructor(
    public readonly code:
      | 'FETCH_FAILED'
      | 'CREATE_FAILED'
      | 'UPDATE_FAILED'
      | 'DELETE_FAILED'
      | 'NOT_FOUND'
      | 'INVALID_INPUT',
    message: string,
  ) {
    super(message);
    this.name = 'TemplateServiceError';
  }
}

/**
 * Template Service
 */
export class TemplateService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * テンプレートに紐づくタグIDを取得
   */
  private async getTagIds(templateId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('plan_template_tags')
      .select('tag_id')
      .eq('template_id', templateId);

    if (error) {
      throw new TemplateServiceError(
        'FETCH_FAILED',
        `Failed to fetch template tags: ${error.message}`,
      );
    }

    return data.map((row) => row.tag_id);
  }

  /**
   * 複数テンプレートのタグIDをバッチ取得
   */
  private async getTagIdsForTemplates(templateIds: string[]): Promise<Map<string, string[]>> {
    if (templateIds.length === 0) return new Map();

    const { data, error } = await this.supabase
      .from('plan_template_tags')
      .select('template_id, tag_id')
      .in('template_id', templateIds);

    if (error) {
      throw new TemplateServiceError(
        'FETCH_FAILED',
        `Failed to fetch template tags: ${error.message}`,
      );
    }

    const tagMap = new Map<string, string[]>();
    for (const row of data) {
      const existing = tagMap.get(row.template_id) ?? [];
      existing.push(row.tag_id);
      tagMap.set(row.template_id, existing);
    }

    return tagMap;
  }

  /**
   * テンプレートのタグを同期（削除→挿入）
   */
  private async syncTags(userId: string, templateId: string, tagIds: string[]): Promise<void> {
    // 既存のタグを削除
    const { error: deleteError } = await this.supabase
      .from('plan_template_tags')
      .delete()
      .eq('template_id', templateId);

    if (deleteError) {
      throw new TemplateServiceError(
        'UPDATE_FAILED',
        `Failed to delete template tags: ${deleteError.message}`,
      );
    }

    // 新しいタグを挿入
    if (tagIds.length > 0) {
      const insertData = tagIds.map((tagId) => ({
        user_id: userId,
        template_id: templateId,
        tag_id: tagId,
      }));

      const { error: insertError } = await this.supabase
        .from('plan_template_tags')
        .insert(insertData);

      if (insertError) {
        throw new TemplateServiceError(
          'UPDATE_FAILED',
          `Failed to insert template tags: ${insertError.message}`,
        );
      }
    }
  }

  /**
   * テンプレート一覧取得
   *
   * @param options - userId
   * @returns テンプレート配列（使用回数降順 → 更新日降順）
   */
  async list(options: { userId: string }): Promise<PlanTemplate[]> {
    const { userId } = options;

    const { data, error } = await this.supabase
      .from('plan_templates')
      .select('*')
      .eq('user_id', userId)
      .order('use_count', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) {
      throw new TemplateServiceError('FETCH_FAILED', `Failed to fetch templates: ${error.message}`);
    }

    const templateIds = data.map((t) => t.id);
    const tagMap = await this.getTagIdsForTemplates(templateIds);

    return data.map((row) => transformDbTemplate(row, tagMap.get(row.id) ?? []));
  }

  /**
   * テンプレートID指定で取得
   *
   * @param options - userId と templateId
   * @returns テンプレート
   */
  async getById(options: { userId: string; templateId: string }): Promise<PlanTemplate> {
    const { userId, templateId } = options;

    const { data, error } = await this.supabase
      .from('plan_templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new TemplateServiceError('NOT_FOUND', `Template not found: ${templateId}`);
    }

    const tagIds = await this.getTagIds(templateId);
    return transformDbTemplate(data, tagIds);
  }

  /**
   * テンプレート作成
   *
   * @param options - userId と作成データ
   * @returns 作成されたテンプレート
   */
  async create(options: {
    userId: string;
    input: CreateTemplateServiceInput;
  }): Promise<PlanTemplate> {
    const { userId, input } = options;

    // バリデーション
    if (!input.name || input.name.trim().length === 0) {
      throw new TemplateServiceError('INVALID_INPUT', 'Template name is required');
    }
    if (input.name.trim().length > 100) {
      throw new TemplateServiceError(
        'INVALID_INPUT',
        'Template name must be 100 characters or less',
      );
    }
    if (!input.title_pattern || input.title_pattern.trim().length === 0) {
      throw new TemplateServiceError('INVALID_INPUT', 'Title pattern is required');
    }
    if (input.title_pattern.trim().length > 200) {
      throw new TemplateServiceError(
        'INVALID_INPUT',
        'Title pattern must be 200 characters or less',
      );
    }

    const templateData: Database['public']['Tables']['plan_templates']['Insert'] = {
      user_id: userId,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      title_pattern: input.title_pattern.trim(),
      plan_description: input.plan_description?.trim() || null,
      duration_minutes: input.duration_minutes ?? null,
      reminder_minutes: input.reminder_minutes ?? null,
    };

    const { data, error } = await this.supabase
      .from('plan_templates')
      .insert(templateData)
      .select()
      .single();

    if (error) {
      throw new TemplateServiceError(
        'CREATE_FAILED',
        `Failed to create template: ${error.message}`,
      );
    }

    // タグを設定
    const tagIds = input.tag_ids ?? [];
    if (tagIds.length > 0) {
      await this.syncTags(userId, data.id, tagIds);
    }

    return transformDbTemplate(data, tagIds);
  }

  /**
   * テンプレート更新
   *
   * @param options - userId, templateId と更新データ
   * @returns 更新されたテンプレート
   */
  async update(options: {
    userId: string;
    templateId: string;
    updates: UpdateTemplateServiceInput;
  }): Promise<PlanTemplate> {
    const { userId, templateId, updates } = options;

    // 所有権チェック
    await this.getById({ userId, templateId });

    // バリデーション
    if (updates.name !== undefined) {
      if (updates.name.trim().length === 0) {
        throw new TemplateServiceError('INVALID_INPUT', 'Template name cannot be empty');
      }
      if (updates.name.trim().length > 100) {
        throw new TemplateServiceError(
          'INVALID_INPUT',
          'Template name must be 100 characters or less',
        );
      }
    }
    if (updates.title_pattern !== undefined) {
      if (updates.title_pattern.trim().length === 0) {
        throw new TemplateServiceError('INVALID_INPUT', 'Title pattern cannot be empty');
      }
      if (updates.title_pattern.trim().length > 200) {
        throw new TemplateServiceError(
          'INVALID_INPUT',
          'Title pattern must be 200 characters or less',
        );
      }
    }

    // 更新データ準備
    const updateData: Database['public']['Tables']['plan_templates']['Update'] = {};
    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.description !== undefined)
      updateData.description = updates.description?.trim() || null;
    if (updates.title_pattern !== undefined)
      updateData.title_pattern = updates.title_pattern.trim();
    if (updates.plan_description !== undefined)
      updateData.plan_description = updates.plan_description?.trim() || null;
    if (updates.duration_minutes !== undefined)
      updateData.duration_minutes = updates.duration_minutes;
    if (updates.reminder_minutes !== undefined)
      updateData.reminder_minutes = updates.reminder_minutes;

    const { data, error } = await this.supabase
      .from('plan_templates')
      .update(updateData)
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      throw new TemplateServiceError(
        'UPDATE_FAILED',
        `Failed to update template: ${error.message}`,
      );
    }

    // タグ更新
    if (updates.tag_ids !== undefined) {
      await this.syncTags(userId, templateId, updates.tag_ids);
    }

    const tagIds =
      updates.tag_ids !== undefined ? updates.tag_ids : await this.getTagIds(templateId);

    return transformDbTemplate(data, tagIds);
  }

  /**
   * テンプレート削除
   *
   * @param options - userId と templateId
   * @returns 削除されたテンプレート
   */
  async delete(options: { userId: string; templateId: string }): Promise<PlanTemplate> {
    const { userId, templateId } = options;

    // 所有権チェック & 現在のデータ取得
    const template = await this.getById({ userId, templateId });

    // plan_template_tagsの関連を先に削除
    await this.supabase.from('plan_template_tags').delete().eq('template_id', templateId);

    // テンプレート削除
    const { error } = await this.supabase.from('plan_templates').delete().eq('id', templateId);

    if (error) {
      throw new TemplateServiceError(
        'DELETE_FAILED',
        `Failed to delete template: ${error.message}`,
      );
    }

    return template;
  }

  /**
   * 使用回数をインクリメント
   *
   * @param options - userId と templateId
   * @returns 更新されたテンプレート
   */
  async incrementUseCount(options: { userId: string; templateId: string }): Promise<PlanTemplate> {
    const { userId, templateId } = options;

    // 所有権チェック
    const current = await this.getById({ userId, templateId });

    const { data, error } = await this.supabase
      .from('plan_templates')
      .update({ use_count: current.use_count + 1 })
      .eq('id', templateId)
      .select()
      .single();

    if (error) {
      throw new TemplateServiceError(
        'UPDATE_FAILED',
        `Failed to increment use count: ${error.message}`,
      );
    }

    return transformDbTemplate(data, current.tag_ids);
  }
}

/**
 * TemplateService インスタンス作成
 */
export function createTemplateService(supabase: SupabaseClient<Database>) {
  return new TemplateService(supabase);
}
