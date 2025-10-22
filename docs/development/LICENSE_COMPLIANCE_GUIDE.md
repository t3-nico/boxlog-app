# License Compliance Guide - 開発者向け

BoxLog OSS License Compliance System の使い方ガイド

## 📋 目次

- [クイックスタート](#クイックスタート)
- [VS Code統合](#vs-code統合)
- [CLIコマンド](#cliコマンド)
- [ワークフロー](#ワークフロー)
- [トラブルシューティング](#トラブルシューティング)

---

## 🚀 クイックスタート

### 依存関係追加時のチェックフロー

```bash
# 1. 新しいパッケージをインストール
npm install <package-name>

# 2. ライセンス情報を生成
npm run generate-licenses

# 3. コンプライアンスチェック
npm run license:check

# ✅ 合格なら完了
# ❌ 違反があればパッケージを削除して代替を探す
```

### よくある質問

**Q: MIT、Apache-2.0、ISCライセンスは使える？**
A: はい、すべて承認済みライセンスです。

**Q: GPLライセンスは使える？**
A: いいえ。GPL/AGPLはコピーレフト条項により商用アプリで使用できません。

**Q: ライセンスが不明なパッケージは？**
A: 使用禁止です。法的リスクがあるため、必ず代替パッケージを探してください。

---

## 🎨 VS Code統合

### タスクランナー

`Cmd+Shift+P` → `Tasks: Run Task` でライセンス関連タスクを実行:

| タスク名                            | 説明                       | ショートカット |
| ----------------------------------- | -------------------------- | -------------- |
| **📄 Generate License Information** | ライセンス情報を生成       | -              |
| **🔒 License Compliance Check**     | コンプライアンスチェック   | -              |
| **📊 License Statistics**           | ライセンス統計表示         | -              |
| **🔍 View License Policy**          | ポリシー表示               | -              |
| **📋 Full License Audit**           | 完全監査（生成+チェック）  | -              |
| **⚠️ License Check (Strict Mode)**  | 厳格モード（警告もエラー） | -              |

### キーボードショートカット設定（オプション）

`.vscode/keybindings.json` に追加:

```json
[
  {
    "key": "cmd+shift+l",
    "command": "workbench.action.tasks.runTask",
    "args": "🔒 License Compliance Check"
  }
]
```

---

## 💻 CLIコマンド

### ライセンス情報生成

```bash
npm run generate-licenses
```

**出力**:

- `public/oss-credits.json` (153KB) - Web表示用データ
- `public/THIRD_PARTY_NOTICES.txt` (3.9KB) - Apache-2.0 NOTICE集約

**実行タイミング**:

- package.json/package-lock.json変更時
- 手動でライセンス情報を更新したい時

### コンプライアンスチェック

```bash
# 通常チェック（.licensrc.json のルールを適用）
npm run license:check

# 厳格モード（failOn オプション適用）
npm run license:check:force
```

**チェック項目**:

- ✅ 許可ライセンス: 16種類（MIT, Apache-2.0, ISC等）
- ❌ 制限ライセンス: 自動検出（.licensrc.json の onlyAllow に含まれないライセンス）

### ライセンス統計表示

```bash
# 統計サマリー
npm run license:audit

# 全パッケージ詳細（JSON形式）
npm run license:info

# CSVレポート生成
npm run license:report
```

**例: 統計サマリー出力**:

```
├─ MIT: 719
├─ Apache-2.0: 75
├─ ISC: 63
├─ BSD-3-Clause: 16
└─ BSD-2-Clause: 12
```

---

## 🔄 ワークフロー

### 1. 新規パッケージ追加時

```bash
# Step 1: インストール
npm install lodash

# Step 2: ライセンス情報更新
npm run generate-licenses

# Step 3: コンプライアンスチェック
npm run license:check

# Step 4: ライセンス詳細確認（必要に応じて）
npm run license:info | jq '.[] | select(.name | contains("lodash"))'
```

**チェック結果**:

- ✅ 合格 → コミット可能
- ❌ 違反 → パッケージを削除して代替を探す

### 2. 依存関係更新時

```bash
# Step 1: 依存関係更新
npm update

# Step 2: ライセンス情報更新
npm run generate-licenses

# Step 3: 差分確認
git diff public/oss-credits.json

# Step 4: コンプライアンスチェック
npm run license:check
```

### 3. CI/CDパイプライン

GitHub Actionsが自動実行:

**トリガー**:

- `package.json` / `package-lock.json` 変更時
- 週次自動実行（毎週月曜日 0:00 UTC）
- 手動実行（workflow_dispatch）

**処理内容**:

1. ライセンス情報生成
2. コンプライアンスチェック
3. 違反があればビルド失敗
4. PRにコメント投稿（統計情報付き）
5. devブランチに自動コミット

---

## 🎯 ライセンスポリシー

### 許可ライセンス（全16種類）

| ライセンス   | 商用利用 | 注意点                         |
| ------------ | -------- | ------------------------------ |
| MIT          | ✅       | 著作権表示必須                 |
| Apache-2.0   | ✅       | NOTICE表示必須（自動対応済み） |
| ISC          | ✅       | 著作権表示必須                 |
| BSD-2-Clause | ✅       | 著作権表示必須                 |
| BSD-3-Clause | ✅       | 著作権表示 + 推薦禁止条項      |
| MPL-2.0      | ✅       | ファイル単位のコピーレフト     |
| CC0-1.0      | ✅       | パブリックドメイン             |
| 0BSD         | ✅       | 著作権表示不要                 |
| Unlicense    | ✅       | パブリックドメイン             |

### 制限ライセンス（全10種類）

| ライセンス     | 理由                                         | 代替案                               |
| -------------- | -------------------------------------------- | ------------------------------------ |
| GPL-2.0/3.0    | コピーレフト                                 | MITライセンスのパッケージを探す      |
| AGPL-3.0       | 強力なコピーレフト（ネットワーク経由も適用） | Apache-2.0のパッケージを探す         |
| LGPL-2.1/3.0   | 動的リンクのみ許可                           | 代替パッケージを探す                 |
| SSPL           | サーバーサイド利用でソース公開義務           | 代替パッケージを探す                 |
| Commons Clause | 商用利用禁止                                 | 商用利用可能なパッケージを探す       |
| BUSL-1.1       | ビジネス利用に時間制限                       | 代替パッケージを探す                 |
| UNLICENSED     | ライセンス不明                               | 公式ライセンスがあるパッケージを探す |
| UNKNOWN        | ライセンス情報なし                           | 公式パッケージを探す                 |

### 警告ライセンス（3種類）

| ライセンス   | 注意点                                       | 対応         |
| ------------ | -------------------------------------------- | ------------ |
| CC-BY-SA-4.0 | ShareAlike条項（派生物に同一ライセンス適用） | 使用前に確認 |
| EPL-2.0      | 弱いコピーレフト（ファイル単位）             | 使用前に確認 |
| CDDL-1.0     | 弱いコピーレフト（ファイル単位）             | 使用前に確認 |

---

## 🐛 トラブルシューティング

### エラー: "oss-credits.json が見つかりません"

**原因**: ライセンス情報が未生成

**解決方法**:

```bash
npm run generate-licenses
```

### エラー: "ライセンス違反が検出されました"

**原因**: 制限ライセンスのパッケージを使用

**解決方法**:

```bash
# 1. 違反パッケージを特定
npm run license:check

# 2. パッケージの詳細確認（違反ライセンスを持つパッケージを探す）
npm run license:info | jq '.[] | select(.licenses != "MIT" and .licenses != "Apache-2.0" and .licenses != "ISC")'

# 3. パッケージを削除
npm uninstall <package-name>

# 4. 代替パッケージを検索
npm search <similar-package-name>

# 5. 代替パッケージをインストール
npm install <alternative-package>

# 6. 再チェック
npm run generate-licenses && npm run license:check
```

### 警告: "検証済みファクターなし"（MFA関連）

**原因**: 開発環境で無関係な警告が表示される場合がある

**解決方法**: 無視してOK（本番環境のみ必要）

### ビルド失敗: "License compliance check failed"

**原因**: CI/CDで制限ライセンスが検出された

**解決方法**:

1. ローカルで `npm run license:check` 実行
2. 違反パッケージを削除
3. 代替パッケージをインストール
4. 再度プッシュ

---

## 📊 統計情報の見方

### ライセンス分布

```
MIT: 719 packages (80.2%)  ← 最も一般的
Apache-2.0: 75 packages (8.4%)
ISC: 63 packages (7.0%)
BSD-3-Clause: 16 packages (1.8%)
BSD-2-Clause: 12 packages (1.3%)
```

**分析**:

- **80%以上がMIT**: 非常に健全な状態
- **Apache-2.0が8%**: NOTICE要件に自動対応済み
- **その他のライセンス**: すべて許可リスト内

### トップ公開者

```
1. Titus Wormer: 114 packages  ← マークダウン関連
2. Mike Bostock: 38 packages   ← D3.js作者
3. Sindre Sorhus: 29 packages  ← Node.jsユーティリティ
```

**意味**:

- 信頼できる著名な開発者のパッケージを多く使用
- エコシステムの健全性が高い

---

## 🔗 関連リンク

### 内部ドキュメント

- [LICENSE_COMPLIANCE_PLAN.md](../LICENSE_COMPLIANCE_PLAN.md) - 全体計画
- [COMMANDS.md](./COMMANDS.md) - 全コマンド一覧
- [ISSUE_MANAGEMENT.md](./ISSUE_MANAGEMENT.md) - Issue管理

### 外部リソース

- [SPDX License List](https://spdx.org/licenses/) - 公式ライセンス一覧
- [Choose a License](https://choosealicense.com/) - ライセンス選択ガイド
- [TL;DR Legal](https://tldrlegal.com/) - ライセンス要約サイト
- [Open Source Initiative](https://opensource.org/licenses) - OSI承認ライセンス

---

## 📝 変更履歴

| 日付       | バージョン | 変更内容                  |
| ---------- | ---------- | ------------------------- |
| 2025-10-15 | 1.0.0      | 初版作成（Phase 5完了時） |

---

**📖 最終更新**: 2025-10-15 | **担当**: BoxLog Development Team
