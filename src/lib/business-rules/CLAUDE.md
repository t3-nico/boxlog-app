# lib/business-rules/ - ビジネスルール辞書（必須使用）

BoxLogビジネスルール辞書システム実装ガイドライン。

## 🎯 ビジネスルール辞書とは

**バリデーション・権限・ワークフローを中央管理するシステム**。

### 目的
- コード重複の排除
- ビジネスロジックの統一管理
- メンテナンス性の向上
- 技術的失敗の防止

---

## 🚨 必須使用ケース

### 1. バリデーション実装時
```tsx
// ❌ 禁止：個別実装
if (task.title.length > 100) {
  throw new Error('タイトルが長すぎます')
}

// ✅ 必須：BusinessRuleRegistry使用
import { BusinessRuleRegistry } from '@/lib/business-rules'

const rules = BusinessRuleRegistry.getValidator('task')
const validation = rules.validate(taskData)

if (!validation.isValid) {
  throw new Error(validation.errors.join(', '))
}
```

### 2. 権限チェック時
```tsx
// ❌ 禁止：個別実装
if (user.role !== 'admin') {
  throw new Error('権限がありません')
}

// ✅ 必須：BusinessRuleRegistry使用
const permissions = BusinessRuleRegistry.getPermissions('task', user.role)

if (!permissions.canEdit) {
  throw new Error('編集権限がありません')
}
```

### 3. ワークフローステータス遷移時
```tsx
// ❌ 禁止：個別実装
if (currentStatus === 'done') {
  // 完了タスクは編集不可
  throw new Error('完了タスクは編集できません')
}

// ✅ 必須：BusinessRuleRegistry使用
const workflow = BusinessRuleRegistry.getWorkflow('task')
const canTransition = workflow.canTransition(currentStatus, 'in-progress')

if (!canTransition) {
  throw new Error('このステータスには遷移できません')
}
```

---

## 📋 BusinessRuleRegistryの使用方法

### バリデーション
```tsx
import { BusinessRuleRegistry } from '@/lib/business-rules'

// 1. バリデータ取得
const validator = BusinessRuleRegistry.getValidator('task')

// 2. バリデーション実行
const result = validator.validate({
  title: 'タスクタイトル',
  priority: 'high',
  dueDate: new Date()
})

// 3. 結果確認
if (!result.isValid) {
  console.error(result.errors)  // ['タイトルは100文字以内', ...]
}
```

### 権限チェック
```tsx
// 1. 権限情報取得
const permissions = BusinessRuleRegistry.getPermissions('task', 'member')

// 2. 権限確認
if (permissions.canCreate) {
  // タスク作成可能
}

if (permissions.canEdit) {
  // タスク編集可能
}

if (permissions.canDelete) {
  // タスク削除可能
}
```

### ワークフロー管理
```tsx
// 1. ワークフロー取得
const workflow = BusinessRuleRegistry.getWorkflow('task')

// 2. 利用可能な遷移先取得
const availableStatuses = workflow.getAvailableTransitions('in-progress')
// → ['done', 'blocked']

// 3. 遷移可能性チェック
const canTransition = workflow.canTransition('todo', 'done')
// → false（todo → in-progress → done の順序が必要）
```

---

## 🔧 ルール定義

### バリデーションルール定義
```tsx
// lib/business-rules/rules/taskRules.ts
import { z } from 'zod'

export const taskValidationSchema = z.object({
  title: z.string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内'),
  description: z.string()
    .max(1000, '説明は1000文字以内'),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date()
    .refine(date => date > new Date(), '期限は未来の日付を指定'),
})

export const taskRules = {
  validate: (data: unknown) => {
    const result = taskValidationSchema.safeParse(data)
    return {
      isValid: result.success,
      errors: result.success ? [] : result.error.errors.map(e => e.message)
    }
  }
}
```

### 権限ルール定義
```tsx
// lib/business-rules/rules/taskPermissions.ts
export const taskPermissions = {
  admin: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canView: true,
  },
  member: {
    canCreate: true,
    canEdit: true,
    canDelete: false,  // メンバーは削除不可
    canView: true,
  },
  guest: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canView: true,  // 閲覧のみ
  },
}
```

### ワークフロールール定義
```tsx
// lib/business-rules/rules/taskWorkflow.ts
export const taskWorkflow = {
  statuses: ['todo', 'in-progress', 'blocked', 'done'],

  transitions: {
    'todo': ['in-progress', 'blocked'],
    'in-progress': ['done', 'blocked', 'todo'],
    'blocked': ['todo', 'in-progress'],
    'done': [],  // 完了後は遷移不可
  },

  canTransition: (from: string, to: string) => {
    return taskWorkflow.transitions[from]?.includes(to) || false
  },

  getAvailableTransitions: (from: string) => {
    return taskWorkflow.transitions[from] || []
  },
}
```

---

## 📊 ルール登録

### Registry初期化
```tsx
// lib/business-rules/index.ts
import { BusinessRuleRegistry } from './registry'
import { taskRules } from './rules/taskRules'
import { taskPermissions } from './rules/taskPermissions'
import { taskWorkflow } from './rules/taskWorkflow'

// ルール登録
BusinessRuleRegistry.registerValidator('task', taskRules)
BusinessRuleRegistry.registerPermissions('task', taskPermissions)
BusinessRuleRegistry.registerWorkflow('task', taskWorkflow)

export { BusinessRuleRegistry }
```

---

## 🧪 テスト

### ルールのテスト
```tsx
// lib/business-rules/rules/taskRules.test.ts
import { describe, it, expect } from 'vitest'
import { taskRules } from './taskRules'

describe('taskRules', () => {
  it('should validate correct task data', () => {
    const result = taskRules.validate({
      title: 'Valid Task',
      priority: 'high',
      dueDate: new Date('2025-12-31')
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject invalid task data', () => {
    const result = taskRules.validate({
      title: '',  // 空のタイトル
      priority: 'invalid',
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('タイトルは必須です')
  })
})
```

---

## 🔗 関連ドキュメント

- **ビジネスルールガイド**: [`../../../docs/BUSINESS_RULES_GUIDE.md`](../../../docs/BUSINESS_RULES_GUIDE.md)
- **機能開発**: [`../../features/CLAUDE.md`](../../features/CLAUDE.md)
- **共通処理**: [`../CLAUDE.md`](../CLAUDE.md)

---

**📖 最終更新**: 2025-09-30