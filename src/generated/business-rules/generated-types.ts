// 🤖 自動生成されたTypeScript型定義
// 生成日時: 2025-09-26T08:36:15.002Z
// 対象リソース: user, task, project, comment

/**
 * userの型定義
 */
export interface UserType {
  id: string
  createdAt: Date
  updatedAt: Date

  email: string
  password?: string
  name: string
  role: 'user' | 'admin' | 'moderator'
}

/**
 * user作成時の型
 */
export type CreateUserType = Omit<UserType, 'id' | 'createdAt' | 'updatedAt'>

/**
 * user更新時の型
 */
export type UpdateUserType = Partial<CreateUserType>

/**
 * taskの型定義
 */
export interface TaskType {
  id: string
  createdAt: Date
  updatedAt: Date

  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  dueDate?: Date
  assigneeId?: string
}

/**
 * task作成時の型
 */
export type CreateTaskType = Omit<TaskType, 'id' | 'createdAt' | 'updatedAt'>

/**
 * task更新時の型
 */
export type UpdateTaskType = Partial<CreateTaskType>

/**
 * projectの型定義
 */
export interface ProjectType {
  id: string
  createdAt: Date
  updatedAt: Date

  name: string
  description?: string
  status: 'active' | 'archived' | 'completed'
  ownerId: string
}

/**
 * project作成時の型
 */
export type CreateProjectType = Omit<ProjectType, 'id' | 'createdAt' | 'updatedAt'>

/**
 * project更新時の型
 */
export type UpdateProjectType = Partial<CreateProjectType>

/**
 * commentの型定義
 */
export interface CommentType {
  id: string
  createdAt: Date
  updatedAt: Date

  content: string
  authorId: string
  targetType: 'task' | 'project' | 'user'
  targetId: string
}

/**
 * comment作成時の型
 */
export type CreateCommentType = Omit<CommentType, 'id' | 'createdAt' | 'updatedAt'>

/**
 * comment更新時の型
 */
export type UpdateCommentType = Partial<CreateCommentType>

// 統合型エクスポート
export type AllResourceTypes = UserType | TaskType | ProjectType | CommentType
