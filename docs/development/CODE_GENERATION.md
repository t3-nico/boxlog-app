# コード自動生成システム

BoxLogプロジェクトでのコード自動生成の運用ガイド。

---

## 📋 概要

BoxLogでは、ビジネスルール・型定義・バリデーションスキーマを自動生成するスクリプトを提供しています。

**生成スクリプト**: `scripts/business-rules-code-generator.js`

---

## 🚀 使用方法

### 基本的な生成コマンド

```bash
# ビジネスルールコードを生成
npm run generate:business-rules

# バリデーションコードを生成
npm run generate:validation

# 型定義を生成（TypeScript）
npm run generate:types

# スキーマ+テストを生成
npm run generate:schemas

# すべてを生成（strict mode）
npm run generate:all
```

---

## 📁 生成先ディレクトリ

### 自動生成されるファイル

```
src/
├── types/
│   └── generated/          # ← 型定義の生成先
│       ├── user.types.ts
│       ├── task.types.ts
│       └── ...
│
└── **/generated/           # ← その他の生成コード
    ├── validation/
    ├── schemas/
    └── tests/
```

**重要**: これらのディレクトリは`.gitignore`で除外されています。

---

## ⚠️ 重要な注意事項

### 1. 生成ファイルはgit管理外

```bash
# .gitignore
/src/types/generated/
/src/**/generated/
```

**理由**:

- 自動生成されるファイルはソースコード管理不要
- ビルド時・開発時に必要に応じて生成
- マージコンフリクトを避ける

### 2. CI/CDでの生成

```yaml
# 例: GitHub Actions
steps:
  - name: Generate code
    run: npm run generate:all

  - name: Build
    run: npm run build
```

### 3. ローカル開発時

```bash
# 初回セットアップ時
npm install
npm run generate:all

# 開発サーバー起動
npm run dev
```

---

## 🔧 生成スクリプトの詳細

### `npm run generate:business-rules`

**用途**: ビジネスルールコードを生成

**オプション**:

```bash
# 特定リソースのみ生成
node scripts/business-rules-code-generator.js \
  --resources user,task,project,comment

# テスト付きで生成
node scripts/business-rules-code-generator.js \
  --resources user,task --tests

# Strict mode（厳密な型チェック）
node scripts/business-rules-code-generator.js \
  --resources user,task --strict
```

### `npm run generate:types`

**用途**: TypeScript型定義を生成

**生成先**: `./src/types/generated/`

```bash
npm run generate:types
# → src/types/generated/user.types.ts
# → src/types/generated/task.types.ts
# → src/types/generated/project.types.ts
# → src/types/generated/comment.types.ts
```

### `npm run generate:validation`

**用途**: バリデーションコードを生成（Zod等）

**使用例**:

```typescript
// 生成されたバリデーション
import { userValidationSchema } from '@/types/generated/user.validation'

const result = userValidationSchema.safeParse(userData)
```

---

## 📊 生成コードの使用例

### 型定義の使用

```typescript
// 自動生成された型をインポート
import type { User, Task } from '@/types/generated'

const user: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
}
```

### バリデーションの使用

```typescript
import { taskSchema } from '@/types/generated/task.validation'

// バリデーション実行
const result = taskSchema.safeParse(taskData)

if (!result.success) {
  console.error(result.error)
}
```

---

## 🔄 再生成のタイミング

### 必須タイミング

1. **ビジネスルール変更時**
   - データモデル変更
   - バリデーションルール追加

2. **初回セットアップ時**

   ```bash
   git clone <repo>
   npm install
   npm run generate:all  # ← 必須
   ```

3. **ブランチ切り替え時**
   ```bash
   git checkout feature/new-model
   npm run generate:all  # ← データモデル変更がある場合
   ```

### 推奨タイミング

- 定期的な実行（週1回など）
- CI/CDパイプラインで自動実行

---

## 🐛 トラブルシューティング

### Q: 生成ファイルが見つからない

```bash
# A: 生成スクリプトを実行
npm run generate:all
```

### Q: 型エラーが出る

```bash
# A: 型定義を再生成
npm run generate:types
npm run typecheck
```

### Q: バリデーションエラー

```bash
# A: スキーマを再生成
npm run generate:schemas
```

---

## 📝 カスタマイズ

### 新しいリソースを追加

```bash
# 1. ビジネスルール定義を追加
# src/config/business-rules.ts など

# 2. 生成コマンドで指定
npm run generate:business-rules -- \
  --resources user,task,project,comment,newResource
```

### 生成先を変更

```bash
# package.json
"generate:types": "npm run generate:business-rules -- \
  --resources user,task \
  --output ./src/custom/path/generated"
```

---

## 📚 参考リンク

- **生成スクリプト**: `scripts/business-rules-code-generator.js`
- **package.jsonスクリプト**: 58-62行目、93行目

---

**最終更新**: 2025-10-06 | Issue #422
