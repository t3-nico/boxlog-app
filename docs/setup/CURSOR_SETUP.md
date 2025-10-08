
## 概要



- **🔐 セキュリティ**: AIが秘密情報を学習せず、安全な開発
- **⚡ 効率**: コードスニペットとショートカットで高速開発
- **🛡️ 安心**: 機密情報の誤露出を防止

## 📋 前提条件

- [Cursor AI Editor](https://cursor.sh/) インストール済み
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

- ✅ **Tailwind CSS IntelliSense** - スタイリング支援
- ✅ **Prettier** - コード整形
- ✅ **DotEnv** - 環境変数ハイライト


```bash

# サインイン
op signin

# 接続確認
op whoami
```


#### 3.1 統合テスト

```bash
# Cursor統合ヘルスチェック
```

#### 3.2 環境変数確認

```bash
npm run dev
```

## 🎯 Cursor AI 機能活用

### コードスニペット

Cursorで以下のスニペットが利用可能：

| プレフィックス   | 説明              | 生成されるコード                          |
| ---------------- | ----------------- | ----------------------------------------- |
| `react-env`      | React環境変数     | 安全な環境変数取得コード                  |
| `node-config`    | Node.js設定       | バリデーション付き設定オブジェクト        |

### 使用例

```typescript
// Cursor AIで "react-env" と入力すると自動生成
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
}
```

## ⌨️ キーボードショートカット

| ショートカット            | 機能                        |
| ------------------------- | --------------------------- |
| `Ctrl+Shift+P` → `Ctrl+S` | 🔍 セキュリティ監査         |
| `Ctrl+Shift+P` → `Ctrl+D` | 🔐 開発サーバー起動         |

## 🤖 Cursor AI との連携最適化

### セキュリティ設定

```json
{
  "// Cursor AIがコードベースをインデックスしない": true,
  "cursor.privacy.enableCodebaseIndexing": false,
  "cursor.privacy.enableTelemetry": false,

  "cursor.ai.contextFiles": ["docs/CI_CD_SETUP.md", ".env.example"]
}
```

### AI Chatでの活用

Cursor AIチャットで以下のようにやり取りできます：

```
User: 新しいAPIキーを環境変数に追加したい

🤖 「BoxLogプロジェクトでは以下の手順で環境変数を追加できます：

1. .env.local に追加：
   NEW_API_KEY=your-api-key-here

2. .env.example にプレースホルダー追加：
   NEW_API_KEY=your-api-key-here

3. 本番環境では Vercel Dashboard で設定
```

## 🛠️ 開発ワークフロー

### 1. 日常的な開発

```bash
# 1. Cursorでプロジェクトを開く
cursor .

# または手動で：

# 3. 開発サーバー起動（ショートカット: Ctrl+Shift+P → Ctrl+D）
# または手動で：
npm run dev
```

### 2. 新機能開発時

2. **スニペット使用**: `op-env` でコードスニペット生成

### 3. セキュリティチェック

```bash
# 定期的なセキュリティ監査（ショートカット: Ctrl+Shift+P → Ctrl+S）
./scripts/security-monitor.sh
```

## 🎨 Cursor AI Composer活用

### プロンプト例

```

以下の要件：
- PostgreSQL接続情報
- エラーハンドリング付き
- TypeScript対応
```

Cursor AIが自動的に適切なコードを生成します。

## 🔍 トラブルシューティング

### よくある問題


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
2. 秘密情報をコードに直接書かない
3. op-* スニペットを積極的に活用する
4. セキュリティチェックスクリプトを定期実行する
```

### Workspace Templates

```json
{
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


```bash
# セッションキャッシュ有効化
export OP_CACHE=true

# 複数セッション管理
export OP_SESSION_my="session-token"
```

## 🔗 参考リンク

- [Cursor AI Documentation](https://cursor.sh/docs)
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


---

**最終更新**: 2025-09-18
