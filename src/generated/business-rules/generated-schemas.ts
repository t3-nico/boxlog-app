import { z } from 'zod'

// 🤖 自動生成されたZodスキーマ
// 生成日時: 2025-09-26T08:36:15.003Z
// 対象リソース: user, task, project, comment

/**
 * userのZodスキーマ
 */
export const userSchema = z.object({
  id: z.string().uuid('一意識別子はUUID形式である必要があります'),
  createdAt: z.date(),
  updatedAt: z.date(),

  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です').optional(),
  name: z.string().min(1, '名前は必須です'),
  role: z.enum(['user', 'admin', 'moderator'], { errorMap: () => ({ message: '無効な役割です' }) }),
})

/**
 * user作成用スキーマ
 */
export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

/**
 * user更新用スキーマ
 */
export const updateUserSchema = createUserSchema.partial()

// 型推論
export type UserType = z.infer<typeof userSchema>
export type CreateUserType = z.infer<typeof createUserSchema>
export type UpdateUserType = z.infer<typeof updateUserSchema>

/**
 * taskのZodスキーマ
 */
export const taskSchema = z.object({
  id: z.string().uuid('一意識別子はUUID形式である必要があります'),
  createdAt: z.date(),
  updatedAt: z.date(),

  title: z.string().min(3, 'タイトルは3文字以上必要です').max(100, 'タイトルは100文字以下である必要があります'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: '優先度は low, medium, high のいずれかを選択してください' }),
  }),
  status: z.enum(['todo', 'in_progress', 'completed', 'cancelled'], {
    errorMap: () => ({ message: '無効なステータスです' }),
  }),
  dueDate: z.date().optional(),
  assigneeId: z.string().uuid().optional(),
})

/**
 * task作成用スキーマ
 */
export const createTaskSchema = taskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

/**
 * task更新用スキーマ
 */
export const updateTaskSchema = createTaskSchema.partial()

// 型推論
export type TaskType = z.infer<typeof taskSchema>
export type CreateTaskType = z.infer<typeof createTaskSchema>
export type UpdateTaskType = z.infer<typeof updateTaskSchema>

/**
 * projectのZodスキーマ
 */
export const projectSchema = z.object({
  id: z.string().uuid('一意識別子はUUID形式である必要があります'),
  createdAt: z.date(),
  updatedAt: z.date(),

  name: z.string().min(2, 'プロジェクト名は2文字以上必要です'),
  description: z.string().optional(),
  status: z.enum(['active', 'archived', 'completed'], { errorMap: () => ({ message: '無効なステータスです' }) }),
  ownerId: z.string().uuid('オーナーIDはUUID形式である必要があります'),
})

/**
 * project作成用スキーマ
 */
export const createProjectSchema = projectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

/**
 * project更新用スキーマ
 */
export const updateProjectSchema = createProjectSchema.partial()

// 型推論
export type ProjectType = z.infer<typeof projectSchema>
export type CreateProjectType = z.infer<typeof createProjectSchema>
export type UpdateProjectType = z.infer<typeof updateProjectSchema>

/**
 * commentのZodスキーマ
 */
export const commentSchema = z.object({
  id: z.string().uuid('一意識別子はUUID形式である必要があります'),
  createdAt: z.date(),
  updatedAt: z.date(),

  content: z.string().min(1, 'コメント内容は必須です').max(1000, 'コメントは1000文字以下である必要があります'),
  authorId: z.string().uuid('作成者IDはUUID形式である必要があります'),
  targetType: z.enum(['task', 'project', 'user'], { errorMap: () => ({ message: '無効な対象タイプです' }) }),
  targetId: z.string().uuid('対象IDはUUID形式である必要があります'),
})

/**
 * comment作成用スキーマ
 */
export const createCommentSchema = commentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

/**
 * comment更新用スキーマ
 */
export const updateCommentSchema = createCommentSchema.partial()

// 型推論
export type CommentType = z.infer<typeof commentSchema>
export type CreateCommentType = z.infer<typeof createCommentSchema>
export type UpdateCommentType = z.infer<typeof updateCommentSchema>

// 統合スキーマエクスポート
export const allSchemas = {
  user: userSchema,
  task: taskSchema,
  project: projectSchema,
  comment: commentSchema,
}
