# .eslint/ - ESLint ハイブリッドアプローチ設定

## 🎯 概要

BoxLog ESLintは「予防型」アプローチを採用しています。

```
予防（80%）+ 検出（15%）+ レビュー（5%）
```

## 📁 ディレクトリ構造

```
.eslint/
├── eslint.config.js    # メイン設定（致命的7ルールのみ）
├── .eslintignore       # 除外設定
└── README.md          # このファイル
```

## 🚀 使い方

### 開発時

```bash
# コミット前チェック（2.5秒）
npm run lint

# 自動修正
npm run lint:fix
```

### ルール一覧（7個のみ）

1. `react-hooks/rules-of-hooks` - Hooks使用規則
2. `react-hooks/exhaustive-deps` - 依存配列チェック
3. `no-undef` - 未定義変数（warn）
4. `no-unreachable` - 到達不可能コード
5. `no-dupe-keys` - 重複キー
6. `no-constant-condition` - 定数条件
7. `no-empty` - 空ブロック

## 📊 パフォーマンス

- **実行時間**: 2.5秒
- **エラー数**: 35個（従来1000+から97%削減）
- **ルール数**: 7個（従来50個から86%削減）

## 🔗 関連ドキュメント

- **完全ガイド**: [`docs/ESLINT_HYBRID_APPROACH.md`](../docs/ESLINT_HYBRID_APPROACH.md)
- **AI品質基準**: [`.claude/code-standards.md`](../.claude/code-standards.md)
- **VSCodeスニペット**: [`.vscode/boxlog.code-snippets`](../.vscode/boxlog.code-snippets)

## 💡 哲学

**「すべてのエラーを検出する」から「エラーが起きない設計」へ**

- **予防**: VSCodeスニペット + AI用ガイド
- **検出**: 致命的7ルールのみ
- **レビュー**: AI文脈理解

---

**最終更新**: 2025-09-30
**Issue**: [#368 ESLintハイブリッドアプローチへの完全移行](https://github.com/t3-nico/boxlog-app/issues/368)
