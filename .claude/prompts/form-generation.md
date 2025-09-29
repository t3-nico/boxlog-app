# フォーム生成テンプレート

## 概要
BoxLog App用の高機能フォームを自動生成するプロンプトテンプレート。react-hook-form + Zod + shadcn/ui + テーマシステム完全統合。10種類以上のフィールドタイプに対応。

## サポートフィールドタイプ（12種類）

### 1. テキスト系フィールド
- `text` - 単行テキスト
- `textarea` - 複数行テキスト
- `email` - メールアドレス
- `password` - パスワード
- `url` - URL

### 2. 数値・日付系フィールド
- `number` - 数値
- `date` - 日付
- `datetime` - 日時
- `time` - 時刻

### 3. 選択系フィールド
- `select` - セレクトボックス
- `checkbox` - チェックボックス
- `radio` - ラジオボタン

### 4. 特殊フィールド
- `file` - ファイルアップロード

## 入力パラメータ

### 必須パラメータ
- `{FormName}`: フォーム名（PascalCase、例: UserForm, TaskForm）
- `{formName}`: フォーム名（camelCase、例: userForm, taskForm）
- `{entity}`: エンティティ名（kebab-case、例: user, task）

### フィールド定義（JSON形式）
```json
{
  "fields": [
    {
      "name": "title",
      "type": "text",
      "label": "タイトル",
      "required": true,
      "validation": {
        "minLength": 1,
        "maxLength": 100
      }
    },
    {
      "name": "description",
      "type": "textarea",
      "label": "説明",
      "required": false,
      "validation": {
        "maxLength": 1000
      }
    },
    {
      "name": "category",
      "type": "select",
      "label": "カテゴリ",
      "required": true,
      "options": [
        { "value": "urgent", "label": "緊急" },
        { "value": "normal", "label": "通常" },
        { "value": "low", "label": "低" }
      ]
    }
  ]
}
```

## テンプレート構造

### 1. Zodスキーマ生成

```typescript
// src/schemas/{entity}-form.schema.ts
import { z } from 'zod'
import { BusinessRuleRegistry } from '@/generated/business-rules'

export const {FormName}Schema = z.object({
  // テキスト系フィールド
  title: z.string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください'),

  description: z.string()
    .max(1000, '説明は1000文字以内で入力してください')
    .optional(),

  // メール
  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .optional(),

  // パスワード
  password: z.string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'パスワードは大文字・小文字・数字を含む必要があります'),

  // 数値
  priority: z.number()
    .min(1, '優先度は1以上で入力してください')
    .max(10, '優先度は10以下で入力してください'),

  // 日付
  dueDate: z.date()
    .min(new Date(), '期限は今日以降の日付を選択してください')
    .optional(),

  // 時刻
  reminderTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '有効な時刻を入力してください（HH:mm形式）')
    .optional(),

  // URL
  referenceUrl: z.string()
    .url('有効なURLを入力してください')
    .optional(),

  // セレクト
  category: z.enum(['urgent', 'normal', 'low'], {
    errorMap: () => ({ message: 'カテゴリを選択してください' })
  }),

  // チェックボックス
  isPublic: z.boolean().default(false),

  // ラジオ
  status: z.enum(['draft', 'in_progress', 'completed'], {
    errorMap: () => ({ message: 'ステータスを選択してください' })
  }),

  // ファイル
  attachment: z.instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, 'ファイルサイズは5MB以下にしてください')
    .refine(file => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type),
            'JPEG、PNG、PDFファイルのみアップロード可能です')
    .optional(),

  // ビジネスルール辞書からの追加バリデーション
  ...BusinessRuleRegistry.getFormValidation('{entity}')
})

export type {FormName}Data = z.infer<typeof {FormName}Schema>
```

### 2. フォームコンポーネント生成

```typescript
// src/components/forms/{FormName}.tsx
'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save, X, Upload, Calendar, Clock, Eye, EyeOff } from 'lucide-react'

import { {FormName}Schema, type {FormName}Data } from '@/schemas/{entity}-form.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { colors, spacing, typography } from '@/config/theme'
import { createAppError, ERROR_CODES } from '@/config/error-patterns'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

interface {FormName}Props {
  initialData?: Partial<{FormName}Data>
  onSubmit: (data: {FormName}Data) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  title?: string
  description?: string
}

export function {FormName}({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  title = '{FormName}',
  description
}: {FormName}Props) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const form = useForm<{FormName}Data>({
    resolver: zodResolver({FormName}Schema),
    defaultValues: {
      title: '',
      description: '',
      email: '',
      password: '',
      priority: 1,
      category: 'normal',
      isPublic: false,
      status: 'draft',
      ...initialData,
    },
  })

  const handleSubmit = async (data: {FormName}Data) => {
    try {
      setSubmitError(null)
      await onSubmit(data)
    } catch (error) {
      console.error('フォーム送信エラー:', error)
      setSubmitError(error instanceof Error ? error.message : '送信に失敗しました')
    }
  }

  return (
    <ErrorBoundary>
      <Card className={colors.background.card}>
        <CardHeader>
          <CardTitle className={typography.heading.h2}>
            {title}
          </CardTitle>
          {description && (
            <CardDescription className={typography.body.base}>
              {description}
            </CardDescription>
          )}
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className={`space-y-6 ${spacing.component.section.md}`}>

              {/* エラー表示 */}
              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {/* テキストフィールド */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={typography.label.base}>
                      タイトル <Badge variant="destructive" className="ml-1">必須</Badge>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="タイトルを入力してください"
                        className={colors.input.default}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* テキストエリア */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={typography.label.base}>説明</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="説明を入力してください"
                        className={`${colors.input.default} min-h-[120px]`}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      1000文字以内で入力してください
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* メールフィールド */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={typography.label.base}>メールアドレス</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="example@domain.com"
                        className={colors.input.default}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* パスワードフィールド */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={typography.label.base}>
                      パスワード <Badge variant="destructive" className="ml-1">必須</Badge>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="パスワードを入力してください"
                          className={`${colors.input.default} pr-10`}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      8文字以上で、大文字・小文字・数字を含む必要があります
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 数値フィールド */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={typography.label.base}>優先度</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        placeholder="1"
                        className={colors.input.default}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      1（低）から10（高）の範囲で設定してください
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 日付フィールド */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={typography.label.base}>期限</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          className={`${colors.input.default} pr-10`}
                          {...field}
                          value={field.value ? field.value.toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 時刻フィールド */}
              <FormField
                control={form.control}
                name="reminderTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={typography.label.base}>リマインダー時刻</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="time"
                          className={`${colors.input.default} pr-10`}
                          {...field}
                        />
                        <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* URLフィールド */}
              <FormField
                control={form.control}
                name="referenceUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={typography.label.base}>参考URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        className={colors.input.default}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* セレクトフィールド */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={typography.label.base}>
                      カテゴリ <Badge variant="destructive" className="ml-1">必須</Badge>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={colors.input.default}>
                          <SelectValue placeholder="カテゴリを選択してください" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="urgent">🔴 緊急</SelectItem>
                        <SelectItem value="normal">🟡 通常</SelectItem>
                        <SelectItem value="low">🟢 低</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* チェックボックス */}
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className={typography.label.base}>
                        公開設定
                      </FormLabel>
                      <FormDescription>
                        チェックすると他のユーザーからも閲覧可能になります
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {/* ラジオグループ */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className={typography.label.base}>
                      ステータス <Badge variant="destructive" className="ml-1">必須</Badge>
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="draft" id="draft" />
                          <Label htmlFor="draft">📝 下書き</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="in_progress" id="in_progress" />
                          <Label htmlFor="in_progress">🔄 進行中</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="completed" id="completed" />
                          <Label htmlFor="completed">✅ 完了</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ファイルアップロード */}
              <FormField
                control={form.control}
                name="attachment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={typography.label.base}>添付ファイル</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          className={colors.input.default}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            field.onChange(file)
                          }}
                        />
                        <Upload className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      JPEG、PNG、PDFファイル（最大5MB）がアップロード可能です
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>

            <CardFooter className={`flex justify-end space-x-2 ${spacing.component.button.md}`}>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  キャンセル
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading}
                className={colors.primary.DEFAULT}
              >
                {loading ? (
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                保存
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </ErrorBoundary>
  )
}
```

### 3. フォームフック生成

```typescript
// src/hooks/use-{entity}-form.ts
import { useState } from 'react'
import { {FormName}Data } from '@/schemas/{entity}-form.schema'
import { createAppError, ERROR_CODES } from '@/config/error-patterns'
import { BusinessRuleRegistry } from '@/generated/business-rules'

export interface Use{FormName}Return {
  loading: boolean
  error: string | null
  submit: (data: {FormName}Data) => Promise<void>
  reset: () => void
}

export function use{FormName}(
  entityId?: string,
  onSuccess?: () => void
): Use{FormName}Return {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (data: {FormName}Data) => {
    setLoading(true)
    setError(null)

    try {
      // ビジネスルール検証
      await BusinessRuleRegistry.validateBusinessRules(
        '{entity}',
        data,
        entityId ? 'update' : 'create'
      )

      // API呼び出し
      const url = entityId ? `/{entity}/${entityId}` : '/{entity}'
      const method = entityId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw createAppError(
          error.message || 'データの保存に失敗しました',
          ERROR_CODES.API_REQUEST_FAILED
        )
      }

      onSuccess?.()

    } catch (err) {
      console.error('フォーム送信エラー:', err)
      setError(err instanceof Error ? err.message : '送信に失敗しました')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setError(null)
  }

  return {
    loading,
    error,
    submit,
    reset,
  }
}
```

## 使用例

### 基本的な使用方法

```typescript
// pages/users/create.tsx
import { {FormName} } from '@/components/forms/{FormName}'
import { use{FormName} } from '@/hooks/use-{entity}-form'

export default function CreateUserPage() {
  const { submit, loading, error } = use{FormName}(undefined, () => {
    router.push('/users')
  })

  return (
    <div className="container mx-auto py-8">
      <{FormName}
        title="新規ユーザー作成"
        description="ユーザー情報を入力してください"
        onSubmit={submit}
        loading={loading}
        onCancel={() => router.back()}
      />
    </div>
  )
}
```

### 編集モードでの使用

```typescript
// pages/users/[id]/edit.tsx
import { {FormName} } from '@/components/forms/{FormName}'
import { use{FormName} } from '@/hooks/use-{entity}-form'

export default function EditUserPage({ userId }: { userId: string }) {
  const { data: userData } = useUser(userId)
  const { submit, loading } = use{FormName}(userId, () => {
    router.push('/users')
  })

  return (
    <{FormName}
      title="ユーザー編集"
      initialData={userData}
      onSubmit={submit}
      loading={loading}
    />
  )
}
```

## 必須要件チェックリスト

### ✅ フィールドタイプ（12種類対応）
- [x] text - 単行テキスト
- [x] textarea - 複数行テキスト
- [x] email - メールアドレス
- [x] password - パスワード（表示切り替え付き）
- [x] url - URL
- [x] number - 数値
- [x] date - 日付
- [x] time - 時刻
- [x] select - セレクトボックス
- [x] checkbox - チェックボックス
- [x] radio - ラジオボタン
- [x] file - ファイルアップロード

### ✅ 品質保証
- [x] TypeScript完全対応
- [x] Zodバリデーション
- [x] エラーハンドリング
- [x] アクセシビリティ（ARIA属性）
- [x] レスポンシブデザイン

### ✅ システム統合
- [x] ビジネスルール辞書連携
- [x] エラーパターン辞書使用
- [x] テーマシステム準拠
- [x] react-hook-form使用

### ✅ UX機能
- [x] リアルタイムバリデーション
- [x] ローディング状態表示
- [x] エラーメッセージ表示
- [x] 必須フィールド表示
- [x] 入力ヒント表示
- [x] パスワード表示切り替え