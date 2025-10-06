/**
 * タスク関連型の統一エクスポート
 *
 * このファイルは後方互換性のために src/types/task.ts と同じインターフェースを提供します。
 * すべての型定義は機能別にファイル分割されています：
 * - core.ts: 基本型、コメント、添付ファイル等
 * - extended.ts: TaskDetailed、ボード、テンプレート等
 * - operations.ts: フィルター、ソート、統計等
 */

// 基本型
export type {
  TaskStatus,
  TaskPriority,
  Task,
  TaskType,
  TaskLabel,
  TaskComment,
  TaskAttachment,
  TaskTimeEntry,
  TaskHistory,
} from './core'

// 拡張型
export type {
  TaskDetailed,
  CreateTaskDetailedInput,
  UpdateTaskDetailedInput,
  TaskBoardColumn,
  TaskBoard,
  TaskTemplate,
} from './extended'

// 操作型
export type {
  TaskFilters,
  TaskSort,
  TaskQuery,
  TaskListResponse,
  TaskStats,
} from './operations'
