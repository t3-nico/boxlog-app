# E2E Testing with Playwright

BoxLogアプリケーションのE2Eテスト（End-to-End Testing）ドキュメント。

## 📋 目次

- [概要](#概要)
- [セットアップ](#セットアップ)
- [テスト実行](#テスト実行)
- [テストケース](#テストケース)
- [トラブルシューティング](#トラブルシューティング)

## 🎯 概要

PlaywrightによるE2Eテストを使用して、BoxLogの主要機能をブラウザ上で自動テストします。

### テスト対象

- ✅ カレンダービュー（基本機能、ナビゲーション、ビュー切り替え）
- ✅ ミニカレンダー（表示、日付クリック）
- ✅ レスポンシブデザイン（モバイル、タブレット、デスクトップ）
- ✅ アクセシビリティ（キーボード操作、ARIA属性）

## 🚀 セットアップ

### 1. Playwright インストール

```bash
# Playwrightは既にインストール済み (v1.56.0)
# ブラウザバイナリのインストール（初回のみ）
npx playwright install
```

### 2. テスト用ユーザーアカウント作成

E2Eテストには、認証済みセッションが必要です。テスト専用のユーザーアカウントを作成してください。

**推奨設定:**

- MFA（多要素認証）を無効にする
- 通常のメールアドレスとパスワードでログイン可能

### 3. 環境変数設定

`.env.local`に以下を追加：

```bash
# E2E Testing (Playwright)
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-test-password
```

**⚠️ セキュリティ注意:**

- `.env.local`は `.gitignore`で除外されているため、コミットされません
- 本番環境の認証情報は使用しないでください
- テスト専用アカウントを使用してください

## 🧪 テスト実行

### 基本的な実行方法

```bash
# 開発サーバーを起動（別ターミナル）
npm run dev

# テスト実行（認証セットアップ含む）
npx playwright test --config=playwright.config.test.ts

# 特定のテストファイルのみ実行
npx playwright test calendar.spec.ts --config=playwright.config.test.ts

# 特定のブラウザのみ実行
npx playwright test --config=playwright.config.test.ts --project=chromium
```

### インタラクティブモード

```bash
# UI モード（推奨）
npx playwright test --ui --config=playwright.config.test.ts

# ヘッドありモード（ブラウザを表示）
npx playwright test --headed --config=playwright.config.test.ts

# デバッグモード
npx playwright test --debug --config=playwright.config.test.ts
```

### テスト結果の確認

```bash
# レポート表示
npx playwright show-report

# スクリーンショット/ビデオは test-results/ に保存
ls test-results/
```

## 📝 テストケース

### calendar.spec.ts

カレンダービューの包括的なテストスイート（11テストケース）。

#### 基本機能 (4件)

- ✅ カレンダーページが正常に表示される
- ✅ 日付ナビゲーション（前後移動）が機能する
- ✅ ビュー切り替えボタンが機能する
- ✅ 「今日」ボタンで現在の日付に戻る

#### ミニカレンダー (2件)

- ✅ ミニカレンダーが表示される
- ✅ ミニカレンダーで日付をクリックして移動

#### レスポンシブデザイン (3件)

- ✅ モバイルビューで正常に表示される
- ✅ タブレットビューで正常に表示される
- ✅ デスクトップビューでサイドバーが表示される

#### アクセシビリティ (2件)

- ✅ キーボードナビゲーションが機能する
- ✅ ARIA属性が適切に設定されている

## 🔧 トラブルシューティング

### 問題1: 認証エラー

```
Error: テスト用認証情報が設定されていません
```

**解決方法:**

1. `.env.local`に`TEST_USER_EMAIL`と`TEST_USER_PASSWORD`を設定
2. テスト用ユーザーアカウントが存在することを確認
3. MFAが無効になっていることを確認

### 問題2: ポート衝突

```
Error: Port 3000 is already in use
```

**解決方法:**

1. 別ターミナルで`npm run dev`を実行
2. `playwright.config.test.ts`は既存サーバーを使用する設定

### 問題3: テストタイムアウト

```
Error: Test timeout of 30000ms exceeded
```

**解決方法:**

1. 開発サーバーが起動していることを確認
2. ネットワーク接続を確認
3. `playwright.config.test.ts`のタイムアウト設定を調整

### 問題4: 要素が見つからない

```
Error: Locator: locator('[data-testid="calendar-header"]')
Expected: visible
Received: hidden
```

**解決方法:**

1. 認証が正しく行われているか確認
2. `test-results/`のスクリーンショットを確認
3. セレクタが正しいか確認

## 📚 リファレンス

### 認証フロー

1. **セットアップ** (`auth.setup.ts`):
   - テスト用ユーザーでログイン
   - 認証状態を `playwright/.auth/user.json` に保存

2. **テスト実行** (`calendar.spec.ts`):
   - 保存された認証状態を読み込み
   - 認証済みセッションでテスト実行

### ファイル構成

```
src/test/e2e/
├── auth.setup.ts          # 認証セットアップスクリプト
├── calendar.spec.ts       # カレンダービューテスト
├── example.spec.ts        # サンプルテスト
└── README.md              # 本ドキュメント

playwright.config.test.ts  # テスト用設定（認証対応）
playwright.config.ts       # 包括的な設定（6ブラウザプロジェクト）

playwright/.auth/
└── user.json              # 認証状態（git ignore済み）

test-results/              # テスト結果（git ignore済み）
playwright-report/         # レポート（git ignore済み）
```

### 環境変数

| 変数名               | 説明                             | 必須 |
| -------------------- | -------------------------------- | ---- |
| `TEST_USER_EMAIL`    | テスト用ユーザーのメールアドレス | ✅   |
| `TEST_USER_PASSWORD` | テスト用ユーザーのパスワード     | ✅   |

## 🔗 関連ドキュメント

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Playwright Authentication Guide](https://playwright.dev/docs/auth)

---

**📖 最終更新**: 2025-10-22 | **バージョン**: v1.0
