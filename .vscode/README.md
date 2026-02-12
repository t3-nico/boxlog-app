# VSCode設定ガイド

このディレクトリには、Dayoptプロジェクトの推奨VSCode設定が含まれています。

## 📁 ファイル構成

```
.vscode/
├── README.md           # このファイル
├── extensions.json     # 推奨拡張機能リスト
├── settings.json       # プロジェクト固有の設定
└── tasks.json          # タスク定義（npm scriptsのショートカット）
```

---

## 🔌 推奨拡張機能（extensions.json）

### 必須拡張機能

#### 1. **Prettier** (`esbenp.prettier-vscode`)

- **役割**: コードフォーマッター
- **機能**: 保存時に自動的にコードを整形
- **設定**: `.prettierrc`に従ってフォーマット

#### 2. **ESLint** (`dbaeumer.vscode-eslint`)

- **役割**: コード品質チェック
- **機能**:
  - リアルタイムでコードの問題を検出
  - 保存時に自動修正可能な問題を修正
- **設定**: `eslint.config.js`と`.eslintrc.json`を使用

#### 3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)

- **役割**: Tailwind CSS開発支援
- **機能**:
  - クラス名の自動補完
  - カラープレビュー
  - ホバーでスタイル情報表示
- **対応**: `cn()`や`clsx()`関数内でも動作

### 推奨拡張機能（オプション）

#### 4. **TypeScript Next** (`ms-vscode.vscode-typescript-next`)

- **役割**: 最新TypeScript機能サポート
- **機能**:
  - 最新のTypeScript機能を先行利用
  - より正確な型チェック

#### 5. **Error Lens** (`usernamehw.errorlens`)

- **役割**: エラー可視化
- **機能**: エラー・警告をコード行に直接表示
- **効果**: 「問題」タブを開かなくてもエラーが一目瞭然

#### 6. **Code Spell Checker** (`streetsidesoftware.code-spell-checker`)

- **役割**: スペルチェック
- **機能**: コメント・文字列のスペルミスを検出

### インストール方法

#### 方法1: プロジェクトを開いた時の通知から

1. VSCodeでプロジェクトを開く
2. 右下に表示される通知から「すべてインストール」をクリック

#### 方法2: コマンドパレットから

1. `Cmd+Shift+P` (macOS) / `Ctrl+Shift+P` (Windows)
2. 「Extensions: Show Recommended Extensions」を選択
3. 各拡張機能の「インストール」をクリック

#### 方法3: コマンドライン

```bash
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension usernamehw.errorlens
code --install-extension streetsidesoftware.code-spell-checker
```

---

## ⚙️ プロジェクト設定（settings.json）

### 自動フォーマット設定

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

- **保存時に自動フォーマット**: ファイル保存時にPrettierが自動実行
- **デフォルトフォーマッター**: Prettier使用

### ESLint自動修正

```json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

- **保存時に自動修正**: ESLintで修正可能な問題を自動修正
- **対象**: import順序、未使用変数削除など

### TypeScript設定

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.includeAutomaticOptionalChainCompletions": true,
  "typescript.suggest.autoImports": true,
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

- **自動インポート**: `package.json`の依存関係から自動補完
- **オプショナルチェーン**: `?.`の自動補完
- **相対パス**: インポートは相対パスで生成

### Tailwind CSS設定

```json
{
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "(?:[\"'`]([^\"'`]*).*?[\"'`])"],
    ["clsx\\(([^)]*)\\)", "(?:[\"'`]([^\"'`]*).*?[\"'`])"]
  ]
}
```

- **CSSファイル認識**: Tailwind CSSとして扱う
- **関数内補完**: `cn()`と`clsx()`内でもTailwindクラスを補完

### パフォーマンス最適化

```json
{
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/.git/**": true,
    "**/dist/**": true,
    "**/.next/**": true
  }
}
```

- **監視除外**: ビルドファイルや依存関係を監視対象から除外
- **効果**: VSCodeのパフォーマンス向上

### その他の便利機能

```json
{
  "editor.rulers": [80, 120],
  "editor.snippetSuggestions": "top",
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

- **ルーラー**: 80文字・120文字の位置に縦線表示
- **スニペット優先**: スニペットを候補の上位に表示
- **文字列内補完**: 文字列内でも補完を有効化

---

## 🛠️ タスク定義（tasks.json）

VSCodeのタスクランナーで以下のコマンドを実行できます。

### 実行方法

1. `Cmd+Shift+P` → 「Tasks: Run Task」を選択
2. 実行したいタスクを選択

### 主なタスク

| タスク           | コマンド            | 説明                    |
| ---------------- | ------------------- | ----------------------- |
| 開発サーバー起動 | `npm run dev`       | Next.js開発サーバー起動 |
| ビルド           | `npm run build`     | 本番用ビルド            |
| Lint             | `npm run lint`      | ESLintチェック          |
| 型チェック       | `npm run typecheck` | TypeScriptの型チェック  |
| テスト           | `npm run test`      | Vitestでテスト実行      |

---

## 🚀 初回セットアップ

プロジェクトをクローンした後、以下を実行してください：

### 1. 依存関係のインストール

```bash
npm ci
```

### 2. VSCode拡張機能のインストール

- VSCodeでプロジェクトを開くと、推奨拡張機能のインストール通知が表示されます
- 「すべてインストール」をクリック

### 3. VSCodeの再読み込み

- `Cmd+Shift+P` → 「Reload Window」
- または、VSCodeを再起動

### 4. 動作確認

1. 任意の`.ts`または`.tsx`ファイルを開く
2. コードを編集して保存
3. 自動フォーマット・ESLint修正が動作すればOK

---

## 🔧 トラブルシューティング

### フォーマットが動作しない

**原因**: Prettierが正しく認識されていない

**解決策**:

1. `Cmd+Shift+P` → 「Format Document With...」
2. 「Prettier - Code formatter」を選択
3. 「既定のフォーマッタとして設定」を選択

### ESLintが動作しない

**原因**: ESLint拡張機能が無効化されている

**解決策**:

1. 拡張機能タブを開く
2. 「ESLint」を検索
3. 「有効にする」をクリック

### Tailwind補完が効かない

**原因**: Tailwind CSS拡張機能が認識していない

**解決策**:

1. VSCodeを再読み込み（`Cmd+Shift+P` → 「Reload Window」）
2. `tailwind.config.ts`が存在することを確認
3. `cn()`や`clsx()`を使用している場合、`settings.json`の`classRegex`を確認

### パフォーマンスが遅い

**原因**: 大量のファイルを監視している

**解決策**:

- `settings.json`の`files.watcherExclude`を確認
- `.next`や`node_modules`が除外されているか確認

---

## 📝 カスタマイズ

個人的な設定をプロジェクト全体に影響させたくない場合は、
ユーザー設定（`~/Library/Application Support/Code/User/settings.json`）で上書きしてください。

**例**: フォントサイズを変更したい

```json
{
  "editor.fontSize": 14
}
```

---

## 🔗 関連ドキュメント

- [VSCode公式ドキュメント](https://code.visualstudio.com/docs)
- [Prettier設定](../.prettierrc)
- [ESLint設定](../eslint.config.js)
- [TypeScript設定](../tsconfig.json)
- [Tailwind CSS設定](../tailwind.config.ts)

---

**最終更新**: 2025-10-27
