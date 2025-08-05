# 🤖 Cursor AI + 1Password 統合セットアップガイド

## 概要

BoxLogプロジェクトでCursor AIエディタと1Password Developer Securityを組み合わせて、**最高の開発体験**を実現するためのセットアップガイドです。

## 🚀 なぜCursor + 1Password？

- **🔐 セキュリティ**: AIが秘密情報を学習せず、安全な開発
- **🤖 AI支援**: 1Password設定もAIがサポート
- **⚡ 効率**: コードスニペットとショートカットで高速開発
- **🛡️ 安心**: 機密情報の誤露出を防止

## 📋 前提条件

- [Cursor AI Editor](https://cursor.sh/) インストール済み
- 1Password アカウント（個人またはチーム）
- BoxLogプロジェクトへのアクセス権限

## 🔧 セットアップ手順

### 1. Cursor AI エディタの設定

#### 1.1 プロジェクトを開く

```bash
# BoxLogプロジェクトをCursorで開く
cursor /path/to/boxlog-app
```

#### 1.2 拡張機能の確認

Cursorが自動的に推奨拡張機能を提案します：
- ✅ **1Password for VS Code** - 自動でインストール推奨
- ✅ **Tailwind CSS IntelliSense** - スタイリング支援
- ✅ **Prettier** - コード整形
- ✅ **DotEnv** - 環境変数ハイライト

### 2. 1Password CLI セットアップ

```bash
# 1Password CLIインストール（未インストールの場合）
brew install --cask 1password/tap/1password-cli

# サインイン
op signin

# 接続確認
op whoami
```

### 3. Cursor AI + 1Password 統合確認

#### 3.1 統合テスト

```bash
# Cursor統合ヘルスチェック
./scripts/1password-dev-tools.sh health
```

#### 3.2 環境変数確認

```bash
# 1Password経由の環境変数読み込みテスト
npm run dev
```

## 🎯 Cursor AI 機能活用

### コードスニペット

Cursorで以下のスニペットが利用可能：

| プレフィックス | 説明 | 生成されるコード |
|---------------|------|------------------|
| `op-ref` | 1Password参照形式 | `"op://BoxLog Development/Item/field"` |
| `op-env` | 環境変数定義 | `VAR="op://vault/item/field"` |
| `op-run` | CLI実行コマンド | `op run --env-file=.env.local -- command` |
| `react-op-env` | React環境変数 | 安全な環境変数取得コード |
| `node-op-config` | Node.js設定 | バリデーション付き設定オブジェクト |

### 使用例

```typescript
// Cursor AIで "react-op-env" と入力すると自動生成
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined. Check your 1Password configuration.')
}
```

## ⌨️ キーボードショートカット

| ショートカット | 機能 |
|---------------|------|
| `Ctrl+Shift+P` → `Ctrl+1` | 🤖 1Password ヘルスチェック |
| `Ctrl+Shift+P` → `Ctrl+S` | 🔍 セキュリティ監査 |
| `Ctrl+Shift+P` → `Ctrl+D` | 🔐 開発サーバー起動 |
| `Ctrl+Shift+P` → `Ctrl+V` | 📦 Vault情報表示 |

## 🤖 Cursor AI との連携最適化

### セキュリティ設定

```json
{
  "// Cursor AIがコードベースをインデックスしない": true,
  "cursor.privacy.enableCodebaseIndexing": false,
  "cursor.privacy.enableTelemetry": false,
  
  "// 1Password関連ファイルをAIコンテキストに追加": true,
  "cursor.ai.contextFiles": [
    "docs/1PASSWORD_SETUP.md",
    "docs/CI_CD_SETUP.md", 
    ".env.example"
  ]
}
```

### AI Chatでの活用

Cursor AIチャットで以下のようにやり取りできます：

```
👤 「1Passwordで新しいAPIキーを追加したい」

🤖 「BoxLogプロジェクトでは以下のコマンドで新しいAPIキーを追加できます：

op item create \
  --category="API Credential" \
  --title="New API Service" \
  --vault="BoxLog Development" \
  'api_key[password]=your-api-key-here'

その後、.env.localに参照を追加：
NEW_API_KEY="op://BoxLog Development/New API Service/api_key"
```

## 🛠️ 開発ワークフロー

### 1. 日常的な開発

```bash
# 1. Cursorでプロジェクトを開く
cursor .

# 2. 1Password統合確認（ショートカット: Ctrl+Shift+P → Ctrl+1）
# または手動で：
./scripts/1password-dev-tools.sh health

# 3. 開発サーバー起動（ショートカット: Ctrl+Shift+P → Ctrl+D）
# または手動で：
npm run dev
```

### 2. 新機能開発時

1. **AI Chat活用**: Cursor AIに「1Passwordで新しい環境変数を設定する方法は？」と質問
2. **スニペット使用**: `op-env` でコードスニペット生成
3. **自動補完**: Cursor AIが1Password形式を自動提案

### 3. セキュリティチェック

```bash
# 定期的なセキュリティ監査（ショートカット: Ctrl+Shift+P → Ctrl+S）
./scripts/security-monitor.sh
```

## 🎨 Cursor AI Composer活用

### プロンプト例

```
@docs/1PASSWORD_SETUP.md を参考に、新しいデータベース接続設定を1Passwordに安全に保存するコードを書いて

以下の要件：
- PostgreSQL接続情報
- エラーハンドリング付き
- TypeScript対応
```

Cursor AIが自動的に適切なコードを生成します。

## 🔍 トラブルシューティング

### よくある問題

#### 1. Cursor AIが1Password設定を認識しない

```bash
# 解決策: Cursorを再起動してワークスペース設定を再読み込み
# または手動でコンテキストファイルを追加
```

#### 2. スニペットが動作しない

```bash
# 解決策: Cursor設定でsnippetSuggestionsが有効か確認
"editor.snippetSuggestions": "top"
```

#### 3. ショートカットが競合する

```bash
# 解決策: .vscode/keybindings.json でカスタムショートカット設定
```

## 🚀 高度な使用法

### Custom AI Rules

Cursor AIに以下のカスタムルールを設定：

```
BoxLogプロジェクトでは：
1. 環境変数は必ず1Password参照形式を使用する
2. 秘密情報をコードに直接書かない
3. op-* スニペットを積極的に活用する
4. セキュリティチェックスクリプトを定期実行する
```

### Workspace Templates

```json
{
  "1password.templates": {
    "api_credential": "op item create --category='API Credential' --title='${title}' --vault='BoxLog Development'",
    "database": "op item create --category='Database' --title='${title}' --vault='BoxLog Development'"
  }
}
```

## 📊 パフォーマンス最適化

### Cursor AI設定

```json
{
  "cursor.autocomplete.enabled": true,
  "cursor.autocomplete.acceptOnTab": true,
  "cursor.autocomplete.partialAccepts": true,
  "cursor.general.enableComposer": true
}
```

### 1Password CLI最適化

```bash
# セッションキャッシュ有効化
export OP_CACHE=true

# 複数セッション管理
export OP_SESSION_my="session-token"
```

## 🔗 参考リンク

- [Cursor AI Documentation](https://cursor.sh/docs)
- [1Password Developer Documentation](https://developer.1password.com/)
- [BoxLog 1Password Setup Guide](./1PASSWORD_SETUP.md)
- [Cursor AI Settings Reference](https://cursor.sh/settings)

## 💡 ベストプラクティス

1. **セキュリティファースト**: AIに秘密情報を直接送信しない
2. **コンテキスト活用**: 設定ファイルをAIのコンテキストに追加
3. **スニペット活用**: 手動入力ミスを防ぐ
4. **定期監査**: セキュリティチェックを怠らない
5. **チーム共有**: 設定をチーム全体で統一

---

**作成日**: 2025-08-05  
**更新日**: 2025-08-05  
**バージョン**: 1.0 - Cursor AI統合版

**🎉 これでCursor AI + 1Password の最強開発環境が完成です！**