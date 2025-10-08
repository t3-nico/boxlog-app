import { z } from 'zod'

// 基本バリデーションスキーマ
export const EventValidationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isAllDay: z.boolean().optional().default(false),
  type: z.enum(['event', 'task', 'reminder'] as const).default('event'),
  status: z.enum(['inbox', 'planned', 'in_progress', 'completed', 'cancelled'] as const).default('inbox'),
  priority: z.enum(['urgent', 'important', 'necessary', 'delegate', 'optional'] as const).optional(),
  color: z.string().optional(),
  location: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  tagIds: z.array(z.string()).optional().default([]),
  reminders: z
    .array(
      z.object({
        minutes: z.number().min(0),
        type: z.enum(['email', 'notification']).default('notification'),
      })
    )
    .optional()
    .default([]),
  recurrence: z
    .object({
      frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
      interval: z.number().min(1).default(1),
      endDate: z.date().optional(),
      count: z.number().min(1).optional(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        completed: z.boolean().default(false),
      })
    )
    .optional()
    .default([]),
})

// 作成用バリデーション（idを除外してからrefineを適用）
export const CreateEventSchema = EventValidationSchema.omit({ id: true }).refine(
  (data) => {
    // 終了日は開始日より後である必要がある
    if (data.startDate && data.endDate) {
      return data.endDate >= data.startDate
    }
    return true
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
)

// 更新用バリデーション（partialにしてからrefineを適用）
export const UpdateEventSchema = EventValidationSchema.partial().refine(
  (data) => {
    // 終了日は開始日より後である必要がある
    if (data.startDate && data.endDate) {
      return data.endDate >= data.startDate
    }
    return true
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
)

// フルバリデーション用（refineを適用）
const EventValidationSchemaWithRefine = EventValidationSchema.refine(
  (data) => {
    // 終了日は開始日より後である必要がある
    if (data.startDate && data.endDate) {
      return data.endDate >= data.startDate
    }
    return true
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
)

// 検索・フィルター用バリデーション
export const EventFiltersSchema = z
  .object({
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    types: z.array(z.enum(['event', 'task', 'reminder'] as const)).optional(),
    statuses: z.array(z.enum(['inbox', 'planned', 'in_progress', 'completed', 'cancelled'] as const)).optional(),
    tagIds: z.array(z.string()).optional(),
    searchQuery: z.string().optional(),
  })
  .refine(
    (data) => {
      // 終了日は開始日より後である必要がある
      if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate
      }
      return true
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )

// バリデーション結果の型
export type EventValidationResult = z.infer<typeof EventValidationSchemaWithRefine>
export type CreateEventValidationResult = z.infer<typeof CreateEventSchema>
export type UpdateEventValidationResult = z.infer<typeof UpdateEventSchema>
export type EventFiltersValidationResult = z.infer<typeof EventFiltersSchema>

// バリデーション関数
export function validateEvent(data: unknown): EventValidationResult {
  return EventValidationSchemaWithRefine.parse(data)
}

export function validateCreateEvent(data: unknown): CreateEventValidationResult {
  return CreateEventSchema.parse(data)
}

export function validateUpdateEvent(data: unknown): UpdateEventValidationResult {
  return UpdateEventSchema.parse(data)
}

export function validateEventFilters(data: unknown): EventFiltersValidationResult {
  return EventFiltersSchema.parse(data)
}

// Safe バリデーション関数（例外を投げない）
export function safeValidateEvent(data: unknown) {
  return EventValidationSchemaWithRefine.safeParse(data)
}

export function safeValidateCreateEvent(data: unknown) {
  return CreateEventSchema.safeParse(data)
}

export function safeValidateUpdateEvent(data: unknown) {
  return UpdateEventSchema.safeParse(data)
}

export function safeValidateEventFilters(data: unknown) {
  return EventFiltersSchema.safeParse(data)
}

// カスタムバリデーション関数
export function validateDateRange(startDate: Date | undefined, endDate: Date | undefined): string | null {
  if (!startDate || !endDate) return null
  if (endDate < startDate) return 'End date must be after start date'
  return null
}

export function validateTitle(title: string): string | null {
  if (!title.trim()) return 'Title is required'
  if (title.length > 200) return 'Title must be less than 200 characters'
  return null
}

export function validateUrl(url: string): string | null {
  if (!url) return null
  try {
    new URL(url)
    return null
  } catch {
    return 'Invalid URL format'
  }
}

// フィールド別バリデーション
export const fieldValidators = {
  title: validateTitle,
  dateRange: validateDateRange,
  url: validateUrl,
} as const
