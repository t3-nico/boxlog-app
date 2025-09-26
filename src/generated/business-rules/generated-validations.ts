// 🤖 自動生成されたバリデーション関数
// 生成日時: 2025-09-26T08:36:14.999Z
// 対象リソース: user, task, project, comment

export interface ValidationResult {
  valid: boolean
  message?: string
  code?: string
}

/**
 * userのバリデーション関数
 */
export const validateUser = (data: any): ValidationResult => {
  try {
    // 基本的なバリデーション
    if (!data) {
      return { valid: false, message: 'userデータが必要です', code: 'REQUIRED' }
    }

    if (!data.email || !/^[^@]+@[^@]+$/.test(data.email)) {
      return { valid: false, message: '有効なメールアドレスが必要です', code: 'INVALID_EMAIL' }
    }
    if (data.password && data.password.length < 8) {
      return { valid: false, message: 'パスワードは8文字以上必要です', code: 'WEAK_PASSWORD' }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      message: error.message || '不明なエラー',
      code: 'VALIDATION_ERROR',
    }
  }
}

/**
 * taskのバリデーション関数
 */
export const validateTask = (data: any): ValidationResult => {
  try {
    // 基本的なバリデーション
    if (!data) {
      return { valid: false, message: 'taskデータが必要です', code: 'REQUIRED' }
    }

    if (!data.title || data.title.trim().length < 3) {
      return { valid: false, message: 'タスクタイトルは3文字以上必要です', code: 'TITLE_TOO_SHORT' }
    }
    if (data.title && data.title.length > 100) {
      return { valid: false, message: 'タスクタイトルは100文字以下である必要があります', code: 'TITLE_TOO_LONG' }
    }
    if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
      return {
        valid: false,
        message: '優先度は low, medium, high のいずれかである必要があります',
        code: 'INVALID_PRIORITY',
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      message: error.message || '不明なエラー',
      code: 'VALIDATION_ERROR',
    }
  }
}

/**
 * projectのバリデーション関数
 */
export const validateProject = (data: any): ValidationResult => {
  try {
    // 基本的なバリデーション
    if (!data) {
      return { valid: false, message: 'projectデータが必要です', code: 'REQUIRED' }
    }

    if (!data.name || data.name.trim().length < 2) {
      return { valid: false, message: 'プロジェクト名は2文字以上必要です', code: 'NAME_TOO_SHORT' }
    }
    if (data.status && !['active', 'archived', 'completed'].includes(data.status)) {
      return { valid: false, message: '無効なプロジェクトステータスです', code: 'INVALID_STATUS' }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      message: error.message || '不明なエラー',
      code: 'VALIDATION_ERROR',
    }
  }
}

/**
 * commentのバリデーション関数
 */
export const validateComment = (data: any): ValidationResult => {
  try {
    // 基本的なバリデーション
    if (!data) {
      return { valid: false, message: 'commentデータが必要です', code: 'REQUIRED' }
    }

    if (!data.content || data.content.trim().length < 1) {
      return { valid: false, message: 'コメント内容が必要です', code: 'CONTENT_REQUIRED' }
    }
    if (data.content && data.content.length > 1000) {
      return { valid: false, message: 'コメントは1000文字以下である必要があります', code: 'CONTENT_TOO_LONG' }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      message: error.message || '不明なエラー',
      code: 'VALIDATION_ERROR',
    }
  }
}

// 統合バリデーション関数
export const validateAllResources = {
  user: validateUser,
  task: validateTask,
  project: validateProject,
  comment: validateComment,
}
