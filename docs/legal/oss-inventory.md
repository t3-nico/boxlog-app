# OSS Dependencies Inventory

**最終更新**: 2025-10-14
**総パッケージ数**: 897

このドキュメントは、BoxLogプロジェクトで使用しているOSS（オープンソースソフトウェア）の棚卸しリストです。

---

## ライセンス分布

| ライセンス   | パッケージ数 | 割合     |
| ------------ | ------------ | -------- |
| MIT          | 719          | 80.2%    |
| Apache-2.0   | 75           | 8.4%     |
| ISC          | 63           | 7.0%     |
| BSD-3-Clause | 16           | 1.8%     |
| BSD-2-Clause | 12           | 1.3%     |
| その他       | 11           | 1.2%     |
| **合計**     | **897**      | **100%** |

### ライセンス種別詳細

- **MIT**: 719パッケージ（最も一般的なオープンソースライセンス）
- **Apache-2.0**: 75パッケージ（特許条項を含む寛容なライセンス）
- **ISC**: 63パッケージ（MITに似た寛容なライセンス）
- **BSD-3-Clause**: 16パッケージ（3条項BSDライセンス）
- **BSD-2-Clause**: 12パッケージ（2条項BSDライセンス）
- **その他**: 11パッケージ
  - (AFL-2.1 OR BSD-3-Clause): 1
  - (MIT OR CC0-1.0): 1
  - (MPL-2.0 OR Apache-2.0): 1
  - 0BSD: 1
  - BlueOak-1.0.0: 1
  - CC-BY-4.0: 1
  - CC0-1.0: 1
  - MIT\*: 1
  - MPL-2.0: 1
  - Python-2.0: 1
  - Unlicense: 1

---

## ライセンス適合性チェック

### ✅ 許可されているライセンス

すべてのライセンスが以下のホワイトリストに適合しています：

- MIT
- Apache-2.0
- ISC
- BSD-2-Clause
- BSD-3-Clause
- CC0-1.0
- 0BSD
- Unlicense
- BlueOak-1.0.0
- MPL-2.0（条件付き）

### ⚠️ 注意が必要なライセンス

現在、以下のライセンスは検出されていません（禁止リスト）：

- ❌ AGPL-3.0（強いコピーレフト）
- ❌ GPL-3.0（条件付きで要確認）
- ❌ Commercial/Proprietary（個別確認必須）

---

## 主要依存関係

### フレームワーク・コア

| パッケージ | バージョン | ライセンス |
| ---------- | ---------- | ---------- |
| next       | ^14.x      | MIT        |
| react      | ^18.x      | MIT        |
| react-dom  | ^18.x      | MIT        |
| typescript | ^5.x       | Apache-2.0 |

### UI・スタイリング

| パッケージ     | バージョン | ライセンス |
| -------------- | ---------- | ---------- |
| @radix-ui/\*   | various    | MIT        |
| tailwindcss    | ^4.x       | MIT        |
| clsx           | ^2.x       | MIT        |
| tailwind-merge | ^2.x       | MIT        |
| lucide-react   | ^0.x       | ISC        |

### 状態管理・データフェッチング

| パッケージ            | バージョン | ライセンス |
| --------------------- | ---------- | ---------- |
| zustand               | ^5.x       | MIT        |
| @tanstack/react-query | ^5.x       | MIT        |
| @trpc/client          | ^11.x      | MIT        |
| @trpc/server          | ^11.x      | MIT        |
| @trpc/react-query     | ^11.x      | MIT        |

### バリデーション・フォーム

| パッケージ      | バージョン | ライセンス |
| --------------- | ---------- | ---------- |
| zod             | ^3.x       | MIT        |
| react-hook-form | ^7.x       | MIT        |

### バックエンド・データベース

| パッケージ                    | バージョン | ライセンス |
| ----------------------------- | ---------- | ---------- |
| @supabase/supabase-js         | ^2.x       | MIT        |
| @supabase/auth-helpers-nextjs | ^0.x       | MIT        |

### 国際化

| パッケージ | バージョン | ライセンス |
| ---------- | ---------- | ---------- |
| next-intl  | ^3.x       | MIT        |
| date-fns   | ^4.x       | MIT        |

### 開発ツール

| パッケージ             | バージョン | ライセンス |
| ---------------------- | ---------- | ---------- |
| eslint                 | ^9.x       | MIT        |
| prettier               | ^3.x       | MIT        |
| vitest                 | ^2.x       | MIT        |
| @testing-library/react | ^16.x      | MIT        |

---

## Apache-2.0 パッケージ（NOTICEファイルあり）

Apache-2.0ライセンスのパッケージで、NOTICEファイルが含まれるもの：

1. **@apm-js-collab/code-transformer@0.8.2**
   - NOTICE: `/node_modules/@apm-js-collab/code-transformer/NOTICE`

---

## 完全なライセンスリスト

完全なライセンス情報は以下のファイルを参照してください：

- **JSON形式**: [`oss-licenses-raw.json`](./oss-licenses-raw.json)
- **生成コマンド**:
  ```bash
  npx license-checker --production --json --out docs/legal/oss-licenses-raw.json
  ```

---

## ライセンスチェックコマンド

### 依存関係のライセンス確認

```bash
# 全依存関係のライセンス情報を取得
npx license-checker --production --json

# 特定ライセンスのみを許可（エラーがあればビルド失敗）
npx license-checker --onlyAllow 'MIT;Apache-2.0;ISC;BSD-2-Clause;BSD-3-Clause;CC0-1.0;0BSD;Unlicense' --production

# ライセンスサマリー
npx license-checker --production --summary
```

### CI統合（将来）

```yaml
# .github/workflows/license-check.yml
- name: Check licenses
  run: |
    npm install -g license-checker
    license-checker --onlyAllow 'MIT;Apache-2.0;ISC;BSD-2-Clause;BSD-3-Clause' --production
```

---

## 注意事項

### 1. Apache-2.0のNOTICE継承

Apache-2.0ライセンスのパッケージは、NOTICEファイルが存在する場合、それを配布物に含める必要があります。

現在、以下のパッケージにNOTICEファイルが存在します：

- `@apm-js-collab/code-transformer@0.8.2`

### 2. ライセンステキストの同梱

MITライセンスのパッケージは、著作権表示とライセンステキストを配布物に含める必要があります。

自動化については [`LICENSE_COMPLIANCE_PLAN.md`](./LICENSE_COMPLIANCE_PLAN.md) の Phase 2 を参照してください。

### 3. 定期的な更新

依存関係が追加・更新されるたびに、このインベントリを更新する必要があります。

**推奨頻度**:

- 依存関係追加時: 即座
- 定期更新: 月次

---

## 次のステップ（Phase 1完了後）

- [ ] Phase 2: 自動化基盤の構築
  - `scripts/generate-licenses.ts` 作成
  - `/legal/oss-credits` ページ実装
  - ビルド時自動生成

- [ ] Phase 3: CI統合
  - GitHub Actionsでライセンスチェック
  - NGライセンス検知

詳細は [`LICENSE_COMPLIANCE_PLAN.md`](./LICENSE_COMPLIANCE_PLAN.md) を参照してください。

---

**最終更新**: 2025-10-14
**管理**: BoxLog Development Team
**データソース**: `npx license-checker --production --json`

---

**種類**: 📙 リファレンス
**最終更新**: 2025-12-11
**所有者**: BoxLog 開発チーム
