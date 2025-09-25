# 翻訳キー設計・命名規則ガイド

BoxLogアプリケーションの翻訳キー設計および命名規則の完全ガイドです。

## 🎯 基本原則

### 1. **一貫性** (Consistency)

すべての翻訳キーは統一されたパターンに従う

### 2. **明確性** (Clarity)

キー名から用途・場所が明確にわかる

### 3. **階層性** (Hierarchy)

論理的な階層構造で整理

### 4. **拡張性** (Scalability)

将来の機能追加に対応できる構造

## 📋 命名規則

### 基本フォーマット

```
<namespace>.<context>.<element>[.<variant>]
```

### 例

```typescript
'auth.login.title' // 認証 > ログイン > タイトル
'dashboard.tasks.create' // ダッシュボード > タスク > 作成
'common.actions.save' // 共通 > アクション > 保存
'errors.validation.required' // エラー > バリデーション > 必須
```

## 🏗️ ネームスペース構造

### 1. **common** - 共通要素

```json
{
  "common": {
    "actions": {
      "save": "保存",
      "cancel": "キャンセル",
      "delete": "削除",
      "edit": "編集",
      "create": "作成",
      "update": "更新",
      "search": "検索",
      "filter": "フィルター",
      "sort": "並べ替え",
      "confirm": "確認",
      "reset": "リセット"
    },
    "status": {
      "loading": "読み込み中...",
      "success": "成功",
      "error": "エラー",
      "warning": "警告",
      "info": "情報",
      "pending": "保留中",
      "completed": "完了",
      "failed": "失敗"
    },
    "navigation": {
      "dashboard": "ダッシュボード",
      "tasks": "タスク",
      "calendar": "カレンダー",
      "settings": "設定",
      "profile": "プロフィール",
      "help": "ヘルプ",
      "logout": "ログアウト"
    },
    "time": {
      "now": "今",
      "today": "今日",
      "yesterday": "昨日",
      "tomorrow": "明日",
      "thisWeek": "今週",
      "nextWeek": "来週",
      "thisMonth": "今月",
      "nextMonth": "来月",
      "thisYear": "今年",
      "nextYear": "来年"
    }
  }
}
```

### 2. **auth** - 認証関連

```json
{
  "auth": {
    "login": {
      "title": "サインイン",
      "subtitle": "BoxLogへようこそ",
      "email": "メールアドレス",
      "password": "パスワード",
      "rememberMe": "ログイン状態を保持する",
      "forgotPassword": "パスワードを忘れた方",
      "signIn": "サインイン",
      "signUp": "アカウントを作成"
    },
    "register": {
      "title": "アカウント作成",
      "subtitle": "BoxLogを始めましょう",
      "firstName": "名",
      "lastName": "姓",
      "email": "メールアドレス",
      "password": "パスワード",
      "confirmPassword": "パスワード確認",
      "agreeTerms": "利用規約とプライバシーポリシーに同意する",
      "signUp": "アカウント作成",
      "signIn": "すでにアカウントをお持ちの方"
    }
  }
}
```

### 3. **errors** - エラーメッセージ

```json
{
  "errors": {
    "validation": {
      "required": "{{field}}は必須です",
      "email": "有効なメールアドレスを入力してください",
      "password": "パスワードは8文字以上である必要があります",
      "passwordMismatch": "パスワードが一致しません",
      "minLength": "{{field}}は{{min}}文字以上である必要があります",
      "maxLength": "{{field}}は{{max}}文字以下である必要があります"
    },
    "auth": {
      "invalidCredentials": "メールアドレスまたはパスワードが正しくありません",
      "accountLocked": "アカウントがロックされています",
      "sessionExpired": "セッションの有効期限が切れました",
      "unauthorized": "このアクションを実行する権限がありません"
    },
    "network": {
      "offline": "インターネット接続がありません",
      "timeout": "リクエストがタイムアウトしました",
      "serverError": "サーバーエラーが発生しました",
      "notFound": "リソースが見つかりません"
    }
  }
}
```

### 4. **features** - 機能固有

```json
{
  "dashboard": {
    "title": "ダッシュボード",
    "welcome": "おかえりなさい、{{name}}さん",
    "stats": {
      "totalTasks": "総タスク数",
      "completedTasks": "完了タスク",
      "pendingTasks": "未完了タスク",
      "overdueTasks": "期限超過"
    }
  },
  "tasks": {
    "title": "タスク管理",
    "create": "新しいタスク",
    "edit": "タスク編集",
    "delete": "タスク削除",
    "complete": "完了にする",
    "incomplete": "未完了にする",
    "fields": {
      "title": "タイトル",
      "description": "説明",
      "priority": "優先度",
      "dueDate": "期限",
      "assignee": "担当者",
      "status": "ステータス"
    }
  }
}
```

## 🔧 実装パターン

### 1. **変数補間**

```typescript
// 翻訳ファイル
{
  "welcome": "こんにちは、{{name}}さん",
  "itemCount": "{{count}}個のアイテム"
}

// 使用例
t('welcome', { name: 'ユーザー名' })
t('itemCount', { count: 5 })
```

### 2. **複数形対応**

```typescript
// 翻訳ファイル
{
  "taskCount": {
    "zero": "タスクがありません",
    "one": "1つのタスク",
    "other": "{{count}}個のタスク"
  }
}

// 使用例
t('taskCount', { count: 0 })  // "タスクがありません"
t('taskCount', { count: 1 })  // "1つのタスク"
t('taskCount', { count: 5 })  // "5個のタスク"
```

### 3. **文脈依存**

```typescript
// 翻訳ファイル
{
  "actions": {
    "save": {
      "button": "保存",
      "success": "保存しました",
      "error": "保存に失敗しました",
      "confirm": "変更を保存しますか？"
    }
  }
}
```

### 4. **コンポーネント固有**

```typescript
// 翻訳ファイル
{
  "components": {
    "modal": {
      "title": "確認",
      "close": "閉じる",
      "confirm": "確認",
      "cancel": "キャンセル"
    },
    "datePicker": {
      "placeholder": "日付を選択",
      "today": "今日",
      "clear": "クリア"
    }
  }
}
```

## ✅ ベストプラクティス

### ✅ **推奨事項**

1. **具体的なキー名**

   ```typescript
   ✅ 'auth.login.emailPlaceholder'
   ❌ 'placeholder1'
   ```

2. **階層的構造**

   ```typescript
   ✅ 'dashboard.tasks.create.title'
   ❌ 'dashboardTasksCreateTitle'
   ```

3. **一貫した動詞形**

   ```typescript
   ✅ 'actions.create', 'actions.edit', 'actions.delete'
   ❌ 'actions.create', 'actions.editing', 'actions.removal'
   ```

4. **適切な粒度**
   ```typescript
   ✅ 'errors.validation.email'
   ❌ 'errors.validation.emailMustBeValidFormat'
   ```

### ❌ **避けるべき事項**

1. **略語の使用**

   ```typescript
   ❌ 'btn.sav'
   ✅ 'actions.save'
   ```

2. **数字の使用**

   ```typescript
   ❌ 'error1', 'error2'
   ✅ 'errors.validation.required', 'errors.auth.invalid'
   ```

3. **特殊文字**

   ```typescript
   ❌ 'user-name', 'user_email'
   ✅ 'user.name', 'user.email'
   ```

4. **文脈のないキー**
   ```typescript
   ❌ 'title', 'button'
   ✅ 'auth.login.title', 'actions.save'
   ```

## 🧪 テスト・検証

### 1. **翻訳キーの存在確認**

```typescript
// テストでキーの存在を確認
describe('翻訳キー検証', () => {
  it('すべての必須キーが存在する', () => {
    expect(t('auth.login.title')).not.toBe('auth.login.title')
  })
})
```

### 2. **変数補間のテスト**

```typescript
it('変数補間が正しく動作する', () => {
  expect(t('welcome', { name: 'テスト' })).toBe('こんにちは、テストさん')
})
```

### 3. **翻訳漏れの検出**

```bash
# 未翻訳キーの検出スクリプト
npm run i18n:check-missing
```

## 📝 運用ルール

### 1. **新しいキーの追加**

1. ガイドラインに従ってキー名を決定
2. 英語版・日本語版の両方に追加
3. TypeScript型定義を更新
4. テストでキーの存在を確認

### 2. **既存キーの変更**

1. 変更の影響範囲を確認
2. 全ての使用箇所を更新
3. テストの実行
4. 翻訳者への通知

### 3. **キーの削除**

1. 使用箇所がないことを確認
2. 型定義から削除
3. 翻訳ファイルから削除
4. 関連テストを削除

---

このガイドラインに従うことで、BoxLogアプリケーションの国際化が一貫性を持って実装され、保守性が向上します。
