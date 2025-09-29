# AIプロンプトテンプレート集 - BoxLog App

## 概要

BoxLog App用の完全なコード生成プロンプトテンプレート集です。ビジネスルール辞書・エラーパターン辞書・テーマシステムと完全統合し、一貫した高品質なコードを自動生成します。

## 📋 テンプレート一覧

| テンプレート | 用途 | 対応機能 | ファイル |
|-------------|------|---------|---------|
| **CRUD生成** | データ管理機能 | Create/Read/Update/Delete | [`crud-generation.md`](./crud-generation.md) |
| **フォーム生成** | 入力フォーム | 12種類フィールドタイプ | [`form-generation.md`](./form-generation.md) |
| **テーブル生成** | データ表示 | ソート・フィルター・ページネーション | [`table-generation.md`](./table-generation.md) |
| **認証フロー** | 認証システム | ログイン・登録・リセット・2FA | [`auth-flow-generation.md`](./auth-flow-generation.md) |
| **コンポーネントパターン** | UI部品 | ダイアログ・検索・ナビゲーション | [`component-patterns.md`](./component-patterns.md) |
| **API生成** | バックエンド | RESTful・ファイルアップロード・検索 | [`api-patterns.md`](./api-patterns.md) |
| **テストパターン** | 品質保証 | 単体・統合・E2E・アクセシビリティ | [`testing-patterns.md`](./testing-patterns.md) |

## 🚀 クイックスタート

### 1. 基本的な使用方法

Claude Codeで以下のプロンプトを使用してコードを生成します：

```prompt
BoxLog Appの{テンプレート名}テンプレートを使用して、{エンティティ名}用のコードを生成してください。

パラメータ:
- EntityName: User
- entityName: user
- entity: user

以下の要件に従ってください：
- ビジネスルール辞書を参照
- エラーパターン辞書を使用
- テーマシステムに準拠
- TypeScript完全対応
```

### 2. CRUD機能の生成例

```prompt
BoxLog AppのCRUD生成テンプレートを使用して、Task管理機能を生成してください。

パラメータ:
- EntityName: Task
- entityName: task
- entity: task

フィールド定義:
- title: string (必須, 1-100文字)
- description: string (任意, max 1000文字)
- status: enum ['draft', 'in_progress', 'completed']
- priority: number (1-10)
- dueDate: Date (任意)
- assigneeId: string (任意)

生成ファイル:
- src/types/task.ts
- src/app/api/task/route.ts
- src/app/api/task/[id]/route.ts
- src/hooks/use-task.ts
- src/components/task/TaskList.tsx
```

### 3. フォーム生成例

```prompt
BoxLog Appのフォーム生成テンプレートを使用して、ユーザープロフィール編集フォームを生成してください。

パラメータ:
- FormName: UserProfileForm
- formName: userProfileForm
- entity: user

フィールド構成:
- email: email (必須)
- firstName: text (必須, max 50文字)
- lastName: text (必須, max 50文字)
- bio: textarea (任意, max 500文字)
- avatar: file (画像ファイルのみ)
- birthDate: date (任意)
- website: url (任意)
- notifications: checkbox (デフォルト: true)
- theme: select ['light', 'dark', 'auto']

特別要件:
- プログレス表示なし（単一ステップ）
- リアルタイムバリデーション
- 自動保存機能
```

## 📚 パラメータ一覧

### 共通パラメータ

| パラメータ | 形式 | 説明 | 例 |
|-----------|------|------|-----|
| `{EntityName}` | PascalCase | エンティティ名 | `User`, `Task`, `Project` |
| `{entityName}` | camelCase | エンティティ名 | `user`, `task`, `project` |
| `{entity}` | kebab-case | エンティティ名 | `user`, `task`, `project` |

### フォーム専用パラメータ

| パラメータ | 形式 | 説明 | 例 |
|-----------|------|------|-----|
| `{FormName}` | PascalCase | フォーム名 | `UserForm`, `TaskForm` |
| `{formName}` | camelCase | フォーム名 | `userForm`, `taskForm` |

### テーブル専用パラメータ

| パラメータ | 形式 | 説明 | 例 |
|-----------|------|------|-----|
| `{TableName}` | PascalCase | テーブル名 | `UserTable`, `TaskTable` |
| `{tableName}` | camelCase | テーブル名 | `userTable`, `taskTable` |

## 🎯 フィールドタイプ一覧

### テキスト系（5種類）

| タイプ | 説明 | バリデーション例 |
|--------|------|----------------|
| `text` | 単行テキスト | `min: 1, max: 100` |
| `textarea` | 複数行テキスト | `max: 1000` |
| `email` | メールアドレス | `email()` |
| `password` | パスワード | `min: 8, regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/` |
| `url` | URL | `url()` |

### 数値・日付系（4種類）

| タイプ | 説明 | バリデーション例 |
|--------|------|----------------|
| `number` | 数値 | `min: 1, max: 100` |
| `date` | 日付 | `min: new Date()` |
| `datetime` | 日時 | ISO形式 |
| `time` | 時刻 | `HH:mm` 形式 |

### 選択系（3種類）

| タイプ | 説明 | オプション例 |
|--------|------|-------------|
| `select` | セレクトボックス | `[{value: 'option1', label: '選択肢1'}]` |
| `checkbox` | チェックボックス | `boolean` |
| `radio` | ラジオボタン | `enum ['option1', 'option2']` |

### 特殊（1種類）

| タイプ | 説明 | 制限例 |
|--------|------|-------|
| `file` | ファイルアップロード | `maxSize: 5MB, types: ['image/*', 'application/pdf']` |

## 🏗️ 生成ファイル構成

### CRUD機能生成時

```
src/
├── types/
│   └── {entity}.ts                    # 型定義・Zodスキーマ
├── app/api/
│   └── {entity}/
│       ├── route.ts                   # 一覧・作成API
│       └── [id]/route.ts              # 詳細・更新・削除API
├── hooks/
│   └── use-{entity}.ts                # カスタムフック
└── components/
    └── {entity}/
        └── {EntityName}List.tsx       # 一覧コンポーネント
```

### フォーム生成時

```
src/
├── schemas/
│   └── {entity}-form.schema.ts        # Zodスキーマ
├── components/forms/
│   └── {FormName}.tsx                 # フォームコンポーネント
└── hooks/
    └── use-{entity}-form.ts           # フォームフック
```

### テーブル生成時

```
src/
├── components/tables/
│   └── {TableName}.tsx                # テーブルコンポーネント
├── hooks/
│   └── use-{entity}-table.ts          # テーブルフック
└── app/{entity}/
    └── page.tsx                       # ページコンポーネント
```

## ⚙️ 設定・カスタマイズ

### 1. ビジネスルール辞書連携

```typescript
// 自動生成されるコードで使用される例
import { BusinessRuleRegistry } from '@/generated/business-rules'

// バリデーション
await BusinessRuleRegistry.validateBusinessRules(
  'user',
  data,
  'create',
  { user: session.user }
)

// 権限チェック
await BusinessRuleRegistry.validatePermission('user', 'read', userId)

// アクセスフィルター
const filters = BusinessRuleRegistry.getAccessFilter('user', session.user)
```

### 2. エラーパターン辞書連携

```typescript
// 自動生成されるコードで使用される例
import {
  createAppError,
  executeWithAutoRecovery,
  ERROR_CODES
} from '@/config/error-patterns'

// エラー作成
throw createAppError('認証が必要です', ERROR_CODES.AUTH_REQUIRED)

// 自動復旧機能付き実行
const result = await executeWithAutoRecovery(
  async () => await db.user.findMany(),
  ERROR_CODES.DATABASE_READ_ERROR
)
```

### 3. テーマシステム連携

```typescript
// 自動生成されるコードで使用される例
import { colors, spacing, typography } from '@/config/theme'

// クラス名で使用
<div className={colors.background.card}>
  <h1 className={typography.heading.h1}>
    <Button className={colors.primary.DEFAULT}>
```

## 🔧 詳細カスタマイズガイド

### カスタムフィールドタイプの追加

新しいフィールドタイプを追加する場合：

1. **スキーマ定義の拡張**
```typescript
// カスタムバリデーション追加
const CustomFieldSchema = z.string().refine(
  (val) => customValidation(val),
  { message: 'カスタムバリデーションエラー' }
)
```

2. **フォームコンポーネントの拡張**
```typescript
// 新しいフィールドタイプのレンダリング
case 'custom-field':
  return (
    <CustomFieldComponent
      value={value}
      onChange={handleChange}
      {...fieldProps}
    />
  )
```

### 認証・認可のカスタマイズ

```typescript
// カスタム権限チェック
const customAuthorizeAction = async (user, resource, action) => {
  // カスタムロジック
  if (user.role === 'admin') return true
  if (resource === 'user' && action === 'read' && user.id === resourceId) return true
  throw new Error('権限がありません')
}
```

### API応答形式のカスタマイズ

```typescript
// カスタム応答形式
interface CustomApiResponse<T> {
  data: T
  metadata: {
    timestamp: string
    version: string
    requestId: string
  }
  pagination?: {
    page: number
    limit: number
    total: number
  }
}
```

## 🧪 テスト生成例

### コンポーネントテスト

```prompt
BoxLog Appのテストパターンテンプレートを使用して、UserFormコンポーネントのテストを生成してください。

テスト対象:
- src/components/forms/UserForm.tsx

テスト要件:
- 基本レンダリングテスト
- フォーム操作テスト（入力・送信・バリデーション）
- エラーハンドリングテスト
- アクセシビリティテスト
- レスポンシブテスト

モック対象:
- useUserForm フック
- BusinessRuleRegistry
- エラーパターン辞書
```

### E2Eテスト

```prompt
BoxLog AppのE2Eテストパターンを使用して、ユーザー管理画面のテストを生成してください。

テストシナリオ:
- ログイン → ユーザー一覧表示
- 新規ユーザー作成フロー
- ユーザー編集フロー
- ユーザー削除フロー
- 検索・フィルター機能
- ページネーション

対応ブラウザ:
- Chrome、Firefox、Safari

デバイス:
- デスクトップ（1920x1080）
- タブレット（768x1024）
- モバイル（375x667）
```

## 🚦 品質チェックリスト

### 生成後の確認事項

#### ✅ TypeScript対応
- [ ] 型定義ファイルが作成されている
- [ ] Zodスキーマが定義されている
- [ ] 型安全なAPI実装になっている

#### ✅ システム統合
- [ ] ビジネスルール辞書を参照している
- [ ] エラーパターン辞書を使用している
- [ ] テーマシステムに準拠している
- [ ] ESLintルールに準拠している

#### ✅ 機能要件
- [ ] CRUD操作が実装されている（該当する場合）
- [ ] フォームバリデーションが動作する
- [ ] エラーハンドリングが適切
- [ ] ローディング状態が管理されている

#### ✅ UI/UX要件
- [ ] レスポンシブデザインが適用されている
- [ ] アクセシビリティ対応が含まれている
- [ ] 適切なローディング表示がある
- [ ] エラーメッセージが分かりやすい

#### ✅ セキュリティ要件
- [ ] 認証チェックが実装されている
- [ ] 認可制御が適切
- [ ] バリデーションが十分
- [ ] SQLインジェクション対策済み

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### 1. 生成されたコードでビルドエラー

**症状**: TypeScriptコンパイルエラー
```
error TS2307: Cannot find module '@/generated/business-rules'
```

**解決方法**:
```bash
# ビジネスルール辞書を生成
npm run generate:business-rules

# 型チェック実行
npm run typecheck
```

#### 2. スタイルが適用されない

**症状**: CSSクラスが効かない

**解決方法**:
```typescript
// テーマシステムを正しくインポート
import { colors, spacing, typography } from '@/config/theme'

// 正しい使用例
<div className={colors.background.card}>
```

#### 3. APIエラーが正しく処理されない

**症状**: エラーがキャッチされない

**解決方法**:
```typescript
// エラーパターン辞書を正しくインポート
import { createAppError, ERROR_CODES } from '@/config/error-patterns'

// 正しいエラー処理
try {
  await apiCall()
} catch (error) {
  throw createAppError('API呼び出しに失敗', ERROR_CODES.API_REQUEST_FAILED)
}
```

#### 4. フォームバリデーションが機能しない

**症状**: Zodバリデーションが動作しない

**解決方法**:
```typescript
// react-hook-form と zodResolver の正しい使用
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm({
  resolver: zodResolver(UserFormSchema), // ここが重要
  defaultValues: {...}
})
```

## 📝 リリースノート

### v1.0.0 (2025-09-29)

#### 🎉 新機能
- **CRUD生成テンプレート**: 完全なデータ管理機能
- **フォーム生成テンプレート**: 12種類フィールドタイプ対応
- **テーブル生成テンプレート**: ソート・フィルター・ページネーション
- **認証フローテンプレート**: ログイン・登録・リセット・2FA
- **コンポーネントパターン**: 8種類のUIパターン
- **API生成パターン**: 6種類のAPIパターン
- **テストパターン**: 5種類のテストパターン

#### 🔧 システム統合
- ビジネスルール辞書完全連携
- エラーパターン辞書統合
- テーマシステム準拠
- Next.js 14 App Router対応

#### 📊 品質保証
- TypeScript完全対応
- アクセシビリティ（WCAG AA準拠）
- レスポンシブデザイン
- ESLintルール準拠

## 🤝 コントリビューション

### テンプレートの改善・追加

1. **バグレポート**: [GitHub Issues](https://github.com/t3-nico/boxlog-app/issues)
2. **機能要望**: Issue テンプレートを使用
3. **プルリクエスト**: 事前にIssueで議論

### テンプレート品質基準

新しいテンプレートは以下を満たす必要があります：

- [ ] TypeScript完全対応
- [ ] エラーハンドリング組み込み
- [ ] アクセシビリティ考慮
- [ ] レスポンシブ対応
- [ ] ビジネスルール辞書参照
- [ ] エラーパターン辞書使用
- [ ] テーマシステム準拠
- [ ] テストコード含む

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

**BoxLog App Development Team**
最終更新: 2025-09-29