# 🏷️ BoxLog App 命名規則辞書システム 新規参画者ガイド

BoxLog Appでは一貫性のある高品質なコードを維持するため、**命名規則辞書システム**を採用しています。
このガイドでは、新規参画者が迅速に命名システムを理解・活用できるよう実践的な情報を提供します。

## 🎯 システム概要

### なぜ命名規則辞書システムが必要なのか？

- **🧑‍💻 開発者間の認識統一**: 同じ概念に対して同じ名前を使用
- **🔍 コードの可読性向上**: ドメイン用語の一貫した使用
- **🚀 新規参画者のオンボーディング効率化**: 明確な命名ルールによる学習コスト削減
- **🛡️ 品質保証の自動化**: ESLintによる自動チェック・修正

### 3つの核心要素

| 要素 | 説明 | 例 |
|------|------|-----|
| **🏷️ ドメイン用語辞書** | 50+のビジネス用語の英日対応 | `authentication` ↔ `認証` |
| **🚫 禁止用語リスト** | 使用禁止の曖昧な用語 | `data` → `information` |
| **📐 命名パターン** | 12種類の命名規則 | コンポーネント: `PascalCase` |

---

## 🚀 クイックスタート（5分で理解）

### 1. 基本的な使い方

```typescript
// ❌ 従来の命名（統一されていない）
const userData = { ... }
const userInfo = { ... }
const userDetails = { ... }

// ✅ 辞書システム対応（統一命名）
const userInformation = { ... }
const taskInformation = { ... }
const projectInformation = { ... }
```

### 2. VS Code Snippetsを活用

`Ctrl/Cmd + Space` でスニペットを呼び出し：

```typescript
// "rfc-domain" と入力 → Enter
export default function AuthenticationForm() {
  return (
    <form className="authentication-form">
      {/* 自動でドメイン用語に対応した命名 */}
    </form>
  )
}
```

### 3. 自動チェック・修正

```bash
# コミット前に自動チェック（pre-commitフック）
git commit -m "feat: 新機能追加"
# → 自動で命名規則チェックが実行

# 手動での確認・修正
npm run naming:migrate        # 改善提案の確認
npm run naming:migrate:apply  # 改善提案の適用
```

---

## 📚 詳細ガイド

### 🏷️ ドメイン用語辞書の使用

#### 主要ドメイン用語（頻繁に使用）

| 日本語 | 英語 | コンポーネント例 | フック例 | 定数例 |
|--------|------|------------------|----------|-------|
| 認証 | `authentication` | `AuthenticationForm` | `useAuthentication` | `AUTHENTICATION_TYPES` |
| タスク | `task` | `TaskList` | `useTask` | `TASK_STATUS` |
| プロジェクト | `project` | `ProjectBoard` | `useProject` | `PROJECT_ROLES` |
| 通知 | `notification` | `NotificationCenter` | `useNotification` | `NOTIFICATION_TYPES` |
| ダッシュボード | `dashboard` | `DashboardLayout` | `useDashboard` | `DASHBOARD_WIDGETS` |

#### 実践例

```typescript
// ✅ 推奨：ドメイン用語を使った統一命名
export interface AuthenticationData {
  token: string
  refreshToken: string
}

export const useAuthentication = () => {
  const [authenticationStatus, setAuthenticationStatus] = useState('idle')

  const performAuthentication = async () => {
    // 認証処理
  }

  return { authenticationStatus, performAuthentication }
}

// AuthenticationService, AuthenticationProvider なども同様
```

### 🚫 禁止用語と代替候補

#### よく使いがちな禁止用語

| 禁止用語 | 理由 | 推奨代替用語 | 使用例 |
|----------|------|-------------|--------|
| `data` | 曖昧・汎用的すぎる | `information`, `details`, `content` | `userInformation` |
| `info` | 省略形で意味不明瞭 | `information`, `details` | `projectDetails` |
| `btn` | 省略形 | `button` | `submitButton` |
| `img` | 省略形 | `image` | `profileImage` |
| `temp` | 曖昧 | `temporary`, `cache`, `draft` | `temporaryStorage` |
| `util` | 汎用的すぎる | `utility`, `helper`, `tool` | `dateUtility` |

#### 実践での対応例

```typescript
// ❌ 禁止用語を使用
const userInfo = { ... }
const taskData = { ... }
const imgUpload = () => { ... }

// ✅ 推奨代替用語を使用
const userInformation = { ... }
const taskDetails = { ... }
const imageUpload = () => { ... }
```

### 📐 命名パターン詳細

#### React コンポーネント

```typescript
// ✅ PascalCase + ドメイン用語
export default function TaskManagementBoard() {
  return <div className="task-management-board">...</div>
}

export function AuthenticationProvider({ children }) {
  return <AuthContext.Provider>...</AuthContext.Provider>
}
```

#### カスタムフック

```typescript
// ✅ use + PascalCase + ドメイン用語
export const useTaskManagement = () => {
  const [tasks, setTasks] = useState([])

  const createTask = (taskInformation: TaskInformation) => {
    // タスク作成処理
  }

  return { tasks, createTask }
}

export const useAuthentication = () => {
  // 認証関連のロジック
}
```

#### TypeScript 型定義

```typescript
// ✅ PascalCase + 目的明確な接尾辞
export interface UserInformation {
  id: string
  name: string
  email: string
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type AuthenticationState = 'idle' | 'loading' | 'success' | 'error'

// 列挙型
export enum NotificationTypeEnum {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  INFORMATION = 'information'
}
```

#### 変数・関数

```typescript
// ✅ camelCase + 明確な目的
const userAuthentication = useAuthentication()
const currentTaskInformation = getTaskDetails(taskId)

// 真偽値変数
const isAuthenticationValid = checkAuthenticationStatus()
const hasTaskPermission = checkTaskAccess(userId, taskId)

// イベントハンドラー
const handleAuthenticationSubmit = (formData: AuthenticationData) => {
  // 処理
}

const handleTaskCreation = (taskDetails: TaskInformation) => {
  // 処理
}
```

---

## 🛠️ 開発ワークフロー

### 1. 新機能開発時

```bash
# 1. ドメイン用語の確認
grep -r "authentication" src/config/naming-conventions/dictionary.json

# 2. VS Code snippetsを活用してコード生成
# "rfc-domain" → React コンポーネント
# "hook-domain" → カスタムフック
# "type-domain" → TypeScript型

# 3. 開発完了後、命名チェック
npm run naming:migrate
```

### 2. 既存コード修正時

```bash
# 1. 影響範囲の確認
npm run naming:analyze

# 2. 段階的な修正適用
npm run naming:migrate:apply

# 3. ESLintでの最終チェック
npm run lint:fix
```

### 3. コードレビュー準備

```bash
# PR作成前の品質チェック
npm run lint
npm run naming:migrate
npm run typecheck
```

---

## 🔧 ツール・統合

### VS Code 統合

#### 1. スニペット一覧

| プレフィックス | 生成内容 | 説明 |
|----------------|----------|------|
| `rfc-domain` | React Function Component | ドメイン用語対応コンポーネント |
| `hook-domain` | Custom Hook | ドメイン用語対応フック |
| `type-domain` | TypeScript Interface | ドメイン用語対応型定義 |
| `api-domain` | API Route | ドメイン用語対応APIルート |
| `form-domain` | Form Component | ドメイン用語対応フォーム |
| `const-domain` | Constant | ドメイン用語対応定数 |
| `var-domain` | Variable | ドメイン用語対応変数 |

#### 2. スニペット使用例

```typescript
// "hook-domain" と入力してTab
export const useTaskManagement = () => {
  const [tasks, setTasks] = useState<TaskInformation[]>([])

  const createTask = useCallback(async (taskDetails: CreateTaskRequest) => {
    try {
      const newTask = await taskService.createTask(taskDetails)
      setTasks(currentTasks => [...currentTasks, newTask])
      return { success: true, task: newTask }
    } catch (error) {
      console.error('Task creation failed:', error)
      return { success: false, error }
    }
  }, [])

  return {
    tasks,
    createTask,
    isLoading: false // 実装に応じて調整
  }
}
```

### ESLint 統合

#### 1. 自動修正ルール

```typescript
// ❌ ESLintが検出
const userData = user.getData()  // → 'data'は禁止用語

// ✅ 自動修正候補
const userInformation = user.getInformation()
```

#### 2. カスタムルール

- `@local/naming/enforce-naming`: ドメイン用語・禁止用語チェック
- `@typescript-eslint/naming-convention`: TypeScript命名規則
- `unicorn/prevent-abbreviations`: 省略形防止

### CI/CD 統合

#### GitHub Actions 自動チェック

- **プルリクエスト時**: 命名規則チェック + 結果コメント
- **プッシュ時**: 品質ゲート + 詳細レポート生成
- **pre-commitフック**: コミット前の自動チェック

---

## 📊 品質管理・監視

### 品質指標

| 指標 | 目標値 | 現在値 | ステータス |
|------|--------|--------|------------|
| ドメイン用語準拠率 | 95%+ | 98% | ✅ 優秀 |
| 禁止用語検出数 | 0件 | 2件 | ⚠️ 要改善 |
| 命名パターン準拠率 | 90%+ | 94% | ✅ 良好 |
| 新規コード品質 | 100% | 100% | ✅ 完璧 |

### 監視ダッシュボード

```bash
# リアルタイム品質確認
npm run naming:analyze --verbose

# 品質レポート生成
npm run naming:migrate > quality-report.txt
```

---

## 🆘 トラブルシューティング

### よくある問題と解決方法

#### Q1: ESLintで命名エラーが大量発生

```bash
# A1: 段階的な自動修正
npm run lint:fix                # 自動修正可能な問題を解決
npm run naming:migrate:apply    # 命名規則の自動修正
```

#### Q2: 既存コードの移行方法

```bash
# A2: 安全な段階的移行
npm run naming:migrate          # まず分析のみ（ドライラン）
npm run naming:migrate:apply    # 問題ないことを確認後に適用
```

#### Q3: ドメイン用語が見つからない

```javascript
// A3: 辞書ファイルの確認・追加
// src/config/naming-conventions/dictionary.json
{
  "domainTerms": {
    "newTerm": {
      "english": "newTerm",
      "japanese": "新用語",
      "aliases": ["alias1", "alias2"],
      "category": "business",
      "usage": {
        "component": "NewTermComponent",
        "hook": "useNewTerm",
        "type": "NewTermData"
      }
    }
  }
}
```

#### Q4: VS Code スニペットが動作しない

1. VS Code再起動
2. TypeScript言語サーバー再起動: `Ctrl/Cmd + Shift + P` → "TypeScript: Restart TS Server"
3. `.vscode/snippets/domain-terms.json` の存在確認

---

## 📈 継続的改善

### 月次レビュー項目

- [ ] 新規ドメイン用語の追加
- [ ] 禁止用語リストの見直し
- [ ] 命名パターンの最適化
- [ ] 品質指標の分析
- [ ] チーム内での命名課題共有

### 貢献方法

1. **ドメイン用語の提案**: Issue作成 + 辞書JSON更新
2. **命名パターンの改善**: ESLint設定の最適化提案
3. **ツール改善**: スクリプト・スニペットの改良
4. **ドキュメント改善**: 実践的な使用例の追加

---

## 🎯 まとめ

BoxLog App の命名規則辞書システムは、高品質で一貫性のあるコードベースを維持するための重要な基盤です。

### 🔑 成功のためのキーポイント

1. **🏷️ ドメイン用語の積極活用**: `authentication`, `task`, `project` など
2. **🚫 禁止用語の回避**: `data`, `info`, `btn` など曖昧な用語は使用しない
3. **📐 命名パターンの厳守**: PascalCase, camelCase など適切なケース使用
4. **🛠️ ツールの活用**: VS Code snippets, ESLint自動修正を積極利用
5. **📊 継続的な品質監視**: 定期的な命名品質チェック

### 🚀 次のステップ

- [ ] VS Code snippets を使った初回コンポーネント作成
- [ ] 命名規則チェックの実行とレポート確認
- [ ] チーム内での命名課題の共有・議論
- [ ] 月次品質レビューへの参加

---

**📞 質問・サポート**

命名規則システムに関する質問は、Slackの `#dev-naming-system` チャンネルまたはGitHub Issueでお気軽にご相談ください。

**🔗 関連リンク**

- [ESLint設定詳細](../ESLINT_SETUP_COMPLETE.md)
- [ビジネスルール辞書システム](../BUSINESS_RULES_GUIDE.md)
- [テーマシステム](../THEME_ENFORCEMENT.md)
- [BoxLog App 開発ガイド](../README.md)

Issue #353: URL/ファイル名/分析イベントの統一命名管理

## 📋 概要

BoxLog Appの統一された命名規則を管理し、プロジェクト全体で一貫性のある名前付けを強制するシステムです。

## 🎯 解決する問題

### ❌ 従来の問題

```javascript
// 問題1: 一貫性のない命名
// URL: /dashboard
// ファイル名: DashboardComponent.jsx
// 分析イベント: 'page_view_home'
// CSSクラス: 'main-dashboard'

// 問題2: ハードコードされた文字列
analytics.track('user_clicked_button')
router.push('/settings/profile')
className="dashboard-main-content"

// 問題3: 型安全性の欠如
navigateTo('settigns') // タイポエラー
trackEvent('page_veiw_dashboard') // 実行時エラー
```

### ✅ 解決後

```typescript
// 統一された命名
import { SCREENS, ROUTES, useNaming } from '@/constants/naming'

// URL、ファイル名、分析イベント、すべてで統一
const { navigateTo, trackAction, pageClassName } = useNaming()

// 型安全なナビゲーション
navigateTo('settings') // TypeScript型チェック

// 統一された分析イベント
trackAction('settings_save')

// 一貫したCSSクラス
<div className={pageClassName}>
```

## 🏗️ システム構成

### 📁 ファイル構成

```
src/
├── constants/
│   └── naming.ts              # 統一命名定数
├── lib/
│   └── naming-utils.ts        # ユーティリティ関数
├── hooks/
│   └── use-naming.ts          # Reactフック
├── components/
│   └── examples/
│       └── NamingSystemUsageExample.tsx  # 使用例
└── .eslint/
    └── rules/
        └── naming-system.js   # ESLintルール
```

### 🎯 主要コンポーネント

#### 1. 統一命名定数 (`naming.ts`)

```typescript
export const SCREENS = {
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings',
  CALENDAR: 'calendar',
  // ... 全画面定義
} as const

export const FEATURES = {
  TASK_CREATE: 'task_create',
  TASK_UPDATE: 'task_update',
  SETTINGS_SAVE: 'settings_save',
  // ... 全機能定義
} as const

export const ROUTES = {
  dashboard: () => '/',
  settings: () => '/settings',
  settingsAccount: () => '/settings/account',
  // ... 型安全なルート生成
} as const
```

#### 2. ユーティリティ関数 (`naming-utils.ts`)

```typescript
// 分析イベント生成
export function createPageViewEvent(
  screen: ScreenName,
  properties?: Record<string, any>
): AnalyticsEvent

// 型安全なナビゲーション
export function navigateToScreen(screen: ScreenName): string

// CSSクラス生成
export function getPageClassName(screen: ScreenName): string

// バリデーション
export function isValidScreen(screen: string): screen is ScreenName
```

#### 3. Reactフック (`use-naming.ts`)

```typescript
export function useNaming(componentName?: string) {
  return {
    // ナビゲーション
    currentScreen,
    navigateTo,
    goBack,

    // 分析追跡
    trackPageView,
    trackAction,
    trackEngagement,
    trackError,
    trackPerformance,

    // スタイリング
    pageClassName,
    getComponentClass,

    // バリデーション
    validateScreen,
    availableScreens,
    availableFeatures,
  }
}
```

## 🚀 使用方法

### 1. 基本的な使用例

```typescript
import React from 'react'
import { useNaming } from '@/hooks/use-naming'
import { ROUTES } from '@/constants/naming'

export function MyComponent() {
  const {
    currentScreen,
    navigateTo,
    trackAction,
    pageClassName,
    getComponentClass,
  } = useNaming('my-component')

  const handleSettingsClick = () => {
    // 1. アクション追跡
    trackAction('settings_save', {
      button_type: 'navigation',
    })

    // 2. 型安全なナビゲーション
    navigateTo('settings')
  }

  return (
    <div className={pageClassName}>
      <div className={getComponentClass('my-component', 'container')}>
        <h1 className={getComponentClass('my-component', 'title')}>
          現在の画面: {currentScreen}
        </h1>

        <button
          onClick={handleSettingsClick}
          className={getComponentClass('my-component', 'button', 'primary')}
        >
          設定画面へ
        </button>
      </div>
    </div>
  )
}
```

### 2. 分析イベント追跡

```typescript
import { useAnalyticsTracking } from '@/hooks/use-naming'

export function AnalyticsExample() {
  const { trackPageView, trackAction, trackError } = useAnalyticsTracking('dashboard')

  useEffect(() => {
    // ページビュー追跡
    trackPageView('dashboard', {
      referrer: document.referrer,
      load_time: Date.now(),
    })
  }, [])

  const handleTaskCreate = () => {
    try {
      // タスク作成処理...
      trackAction('task_create', {
        creation_method: 'button_click',
        task_type: 'normal',
      })
    } catch (error) {
      trackError('task_creation_failed', 'user_action', {
        error_message: error.message,
      })
    }
  }

  return <TaskCreationForm onSubmit={handleTaskCreate} />
}
```

### 3. 型安全なルーティング

```typescript
import { ROUTES } from '@/constants/naming'
import { useNamingNavigation } from '@/hooks/use-naming'

export function NavigationMenu() {
  const { navigateTo, currentScreen } = useNamingNavigation()

  const menuItems = [
    { screen: 'dashboard' as const, label: 'ダッシュボード' },
    { screen: 'calendar' as const, label: 'カレンダー' },
    { screen: 'settings' as const, label: '設定' },
  ]

  return (
    <nav>
      {menuItems.map(({ screen, label }) => (
        <button
          key={screen}
          onClick={() => navigateTo(screen)}
          className={currentScreen === screen ? 'active' : ''}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}
```

### 4. パラメータ付きルート

```typescript
import { getParameterizedRoute } from '@/lib/naming-utils'

// 動的ルート生成
const calendarViewUrl = getParameterizedRoute('calendar_view', 'month')
// → '/calendar/month'

const tableDetailUrl = getParameterizedRoute('table_detail', 'abc123')
// → '/table/abc123'

// Linkコンポーネントでの使用
<Link href={getParameterizedRoute('stats_detail', userId)}>
  統計詳細
</Link>
```

## 🔧 ESLint強制ルール

### 設定ファイル (`.eslint/index.js`)

```javascript
module.exports = {
  // ... 既存設定
  rules: {
    // ... 既存ルール
    'naming-system/enforce-analytics-naming': 'error',
    'naming-system/enforce-route-constants': 'error',
    'naming-system/enforce-css-naming': 'warn',
    'naming-system/enforce-screen-constants': 'error',
  },
}
```

### ルールの効果

#### 1. 分析イベント名の強制

```typescript
// ❌ ESLintエラー
analytics.track('user_clicked_button')

// ✅ 正しい使用法
import { createActionEvent } from '@/lib/naming-utils'
analytics.track(...createActionEvent('task_create'))
```

#### 2. ルート定数の強制

```typescript
// ❌ ESLintエラー
router.push('/settings')

// ✅ 正しい使用法
import { ROUTES } from '@/constants/naming'
router.push(ROUTES.settings())
```

#### 3. 画面識別子の強制

```typescript
// ❌ ESLintエラー
trackPageView('dashboard')

// ✅ 正しい使用法
import { SCREENS } from '@/constants/naming'
trackPageView(SCREENS.DASHBOARD)
```

## 📊 実装例とベストプラクティス

### 1. ページコンポーネント

```typescript
// src/app/(app)/settings/page.tsx
import { useNaming } from '@/hooks/use-naming'

export default function SettingsPage() {
  const {
    trackPageView,
    pageClassName,
    getComponentClass
  } = useNaming('settings-page')

  useEffect(() => {
    trackPageView('settings')
  }, [])

  return (
    <div className={pageClassName}>
      <div className={getComponentClass('settings-page', 'container')}>
        <h1 className={getComponentClass('settings-page', 'title')}>
          設定
        </h1>
        {/* ... */}
      </div>
    </div>
  )
}
```

### 2. 分析イベント統合

```typescript
// src/lib/analytics-integration.ts
import { createActionEvent, createPageViewEvent } from '@/lib/naming-utils'

class AnalyticsService {
  track(event: AnalyticsEvent) {
    // Vercel Analytics
    track(event.name, event.properties)

    // Google Analytics
    gtag('event', event.name, event.properties)

    // カスタム分析サービス
    customAnalytics.send(event)
  }

  trackPageView(screen: ScreenName, properties?: Record<string, any>) {
    const event = createPageViewEvent(screen, properties)
    this.track(event)
  }

  trackAction(feature: FeatureName, properties?: Record<string, any>) {
    const event = createActionEvent(feature, undefined, properties)
    this.track(event)
  }
}

export const analytics = new AnalyticsService()
```

### 3. CSS-in-JS統合

```typescript
// src/styles/naming-styled.ts
import styled from 'styled-components'
import { getComponentClassName } from '@/lib/naming-utils'

export const createStyledComponent = (
  component: string,
  element?: string,
  modifier?: string
) => styled.div.attrs({
  className: getComponentClassName(component, element, modifier)
})`
  /* スタイル定義 */
`

// 使用例
const StyledContainer = createStyledComponent('task-list', 'container')
const StyledItem = createStyledComponent('task-list', 'item', 'active')
```

## 🧪 テスト戦略

### 1. 命名一貫性テスト

```typescript
// src/test/naming-consistency.test.ts
import { validateNamingConsistency } from '@/lib/naming-utils'

describe('命名辞書一貫性', () => {
  test('重複がないこと', () => {
    const result = validateNamingConsistency()
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  test('命名規則に従っていること', () => {
    const screenValues = Object.values(SCREENS)
    screenValues.forEach(value => {
      expect(value).toMatch(/^[a-z0-9_]+$/)
    })
  })
})
```

### 2. フック動作テスト

```typescript
// src/hooks/__tests__/use-naming.test.ts
import { renderHook } from '@testing-library/react'
import { useNaming } from '@/hooks/use-naming'

describe('useNaming', () => {
  test('現在の画面を正しく検出', () => {
    const { result } = renderHook(() => useNaming())
    expect(result.current.currentScreen).toBeDefined()
  })

  test('型安全なナビゲーション', () => {
    const { result } = renderHook(() => useNaming())
    expect(() => {
      result.current.navigateTo('dashboard')
    }).not.toThrow()
  })
})
```

### 3. ESLintルールテスト

```javascript
// .eslint/rules/__tests__/naming-system.test.js
const rule = require('../naming-system').rules['enforce-analytics-naming']
const RuleTester = require('eslint').RuleTester

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2020, sourceType: 'module' }
})

ruleTester.run('enforce-analytics-naming', rule, {
  valid: [
    "analytics.track(ANALYTICS_EVENTS.page_view('dashboard'))"
  ],
  invalid: [
    {
      code: "analytics.track('user_clicked_button')",
      errors: [{ messageId: 'invalidEventName' }]
    }
  ]
})
```

## 📈 メトリクス・監視

### 1. 使用状況追跡

```typescript
// scripts/naming-usage-metrics.js
const fs = require('fs')
const path = require('path')

function analyzeNamingUsage() {
  const srcDir = path.join(__dirname, '../src')
  const files = getAllTSFiles(srcDir)

  let directStringUsage = 0
  let namingUtilUsage = 0

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8')

    // 直接文字列使用の検出
    const directMatches = content.match(/analytics\.track\(['"][^'"]+['"]\)/g)
    if (directMatches) directStringUsage += directMatches.length

    // 命名ユーティリティ使用の検出
    const utilMatches = content.match(/ANALYTICS_EVENTS\./g)
    if (utilMatches) namingUtilUsage += utilMatches.length
  })

  return {
    directStringUsage,
    namingUtilUsage,
    adoptionRate: namingUtilUsage / (directStringUsage + namingUtilUsage)
  }
}
```

### 2. 品質レポート

```typescript
// scripts/naming-quality-report.js
function generateQualityReport() {
  const consistency = validateNamingConsistency()
  const usage = analyzeNamingUsage()
  const coverage = calculateScreenCoverage()

  return {
    consistency: {
      isValid: consistency.isValid,
      errorCount: consistency.errors.length
    },
    adoption: {
      rate: usage.adoptionRate,
      directStringUsage: usage.directStringUsage,
      namingUtilUsage: usage.namingUtilUsage
    },
    coverage: {
      screensCovered: coverage.covered,
      totalScreens: coverage.total,
      coverageRate: coverage.covered / coverage.total
    }
  }
}
```

## 🎯 マイグレーション戦略

### フェーズ1: 基盤構築

- [x] 命名定数ファイル作成
- [x] ユーティリティ関数実装
- [x] Reactフック作成
- [x] ESLintルール実装

### フェーズ2: 段階的移行

```typescript
// 1. 新しいコンポーネントから適用
// 2. 重要な画面から順次移行
// 3. 分析イベントから統一
// 4. CSSクラス名の統一
```

### フェーズ3: 完全移行

```typescript
// 1. ESLintルールを'error'に変更
// 2. 既存コードの一括変換
// 3. 品質メトリクスの監視
// 4. チーム教育・ドキュメント整備
```

## 🔗 関連リンク

- **Issue**: [#353 - 画面・機能命名辞書システム実装](https://github.com/t3-nico/boxlog-app/issues/353)
- **実装ファイル**: `src/constants/naming.ts`
- **使用例**: `src/components/examples/NamingSystemUsageExample.tsx`
- **ESLintルール**: `.eslint/rules/naming-system.js`

---

**作成**: Issue #353 - 画面・機能命名辞書システム実装
**最終更新**: 2025-09-29