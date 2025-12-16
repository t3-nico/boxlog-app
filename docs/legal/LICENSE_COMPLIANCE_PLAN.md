# [Legal] 第三者ライセンス表記（OSS/CC/フォント/EULA）整備 & 自動生成

## 背景

SaaSの提供にあたり、利用しているOSS・画像/アイコン（CC系）・フォント・ベンダー配布UIキット等のライセンス順守が必須。画面上のクレジット常時表示は原則不要だが、配布物への著作権表示・NOTICE同梱や**CCの帰属表示（TASL）**等は必要になる。

継続運用できるよう、法務/開発/デザイン横断で自動化し、Next.jsサイトに「第三者ライセンス」ページを公開する。

## ゴール（受け入れ基準）

- [ ] プロダクト配布物（Webクライアント/モバイル/デスクトップ）がOSS LICENSE/NOTICEを同梱している
- [ ] Webサイトに`/legal/oss-credits`（または同等）が公開され、依存リストとライセンス文言を自動生成して表示
- [ ] 画像・アイコン等のCC BY系は適切なクレジット（TASL）を「合理的な場所」へ掲示（ページ直下 or クレジット集約ページ）
- [ ] 使用フォント（OFL/Apache等）は配布時ライセンス同梱方針を明文化（CDN利用時は表記不要の整理）
- [ ] ベンダー独自EULAのUIキット/アイコンはUI内表記義務の有無を確認し、必要なら表示
- [ ] CIで依存関係のライセンス差分チェックが回っている（NGライセンスの検知とブロック）
- [ ] 社内ハンドブックに運用ポリシーと更新手順が追記されている

---

## 段階的実装計画

### Phase 0: 現状棚卸し（1-2日）

**目的**: 何を使っているか把握する

#### タスク

- [ ] `package.json`からOSS依存をリストアップ
- [ ] 画像/アイコンの出典を調査（Figma/`public`フォルダ）
- [ ] フォントのライセンス確認（使用中: Google Fonts等）
- [ ] ベンダーUIキット（shadcn/ui、shadcn-dashboard-landing-template等）のライセンス確認

#### 成果物

- `docs/legal/oss-inventory.md` - OSS棚卸しリスト
- `docs/legal/assets-inventory.md` - 画像/アイコン棚卸し

#### 既知の対応必要項目

- **shadcn-dashboard-landing-template**: MIT License, Copyright (c) 2025 ShadcnStore
  - 使用箇所: エラーページ（404/401/403/500/maintenance）
  - 対応: README.mdとCREDITS.mdに記載済み

---

### Phase 1: 緊急対応（1週間）

**目的**: 既知のライセンス義務を即座に満たす

#### タスク

- [ ] `README.md`にAcknowledgmentsセクション追加
- [ ] `docs/CREDITS.md`作成（詳細クレジット）
- [ ] shadcn-dashboard-landing-templateのクレジット記載
- [ ] 主要OSSライブラリ（React, Next.js, Supabase等）のクレジット追加

#### 成果物

- `README.md` - Acknowledgmentsセクション
- `docs/CREDITS.md` - 第三者ライセンス詳細

---

### Phase 2: 自動化基盤（2週間）

**目的**: 依存ライブラリの自動収集と表示

#### A. 自動生成のセットアップ

##### 依存一覧の取得

```bash
# Node: license-checker
npx license-checker --production --json > third_party/licenses.json

# または pnpm
pnpm licenses list --json > third_party/licenses.json
```

##### 生成スクリプト（Node/TS）で Markdown/JSON を整形

- [ ] `scripts/generate-licenses.ts`作成
  - name@version / license / repository / copyright
  - Apache-2.0のNOTICEを優先的に抽出/連結
  - 重複や同一ライブラリの集約

##### Next.jsに `/legal/oss-credits` ページを追加

- [ ] `app/legal/oss-credits/page.tsx`作成
  - ビルド時に生成物を読み込み表示
  - SSG（Static Site Generation）で公開

##### ビルド時にスクリプト実行

- [ ] `package.json`に`prebuild`スクリプト追加

```json
{
  "scripts": {
    "prebuild": "ts-node scripts/generate-licenses.ts"
  }
}
```

#### B. バイナリ配布対応（将来）

- [ ] Electron/モバイル等があれば`LICENSE`/`NOTICE`同梱を自動化
- [ ] パッケージャー設定（electron-builder, fastlane等）で`THIRD_PARTY_NOTICES.txt`をバンドル

#### 成果物

- `scripts/generate-licenses.ts` - ライセンス自動生成スクリプト
- `public/oss-credits.json` - 生成されたライセンスリスト
- `app/legal/oss-credits/page.tsx` - OSSクレジットページ

---

### Phase 3: CI & ガードレール（1週間）

**目的**: NGライセンスの混入を防止

#### タスク

- [ ] CIで`license-checker`実行＆差分検知
- [ ] 許容ライセンスのホワイトリスト
  - MIT, BSD-2-Clause, BSD-3-Clause, Apache-2.0, ISC
  - OFL (Open Font License), CC0
- [ ] NGライセンスのブラックリスト
  - AGPL-3.0 (強いコピーレフト)
  - GPL-3.0 (条件付きで検討)
  - Commercial/Proprietary（個別確認）
- [ ] NGが入ったらビルド失敗
- [ ] PRテンプレートに「ライセンス影響チェック」チェックボックスを追加

#### CI設定例

```yaml
# .github/workflows/license-check.yml
name: License Check

on: [pull_request]

jobs:
  license-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check licenses
        run: |
          npm install -g license-checker
          license-checker --onlyAllow 'MIT;BSD-2-Clause;BSD-3-Clause;Apache-2.0;ISC;CC0-1.0' --production
```

#### 成果物

- `.github/workflows/license-check.yml` - CIワークフロー
- `.github/pull_request_template.md` - PRテンプレート更新

---

### Phase 4: 画像/アイコン（CC）取り扱い（2週間）

**目的**: クリエイティブ・コモンズライセンスの適切な帰属表示

#### C. 画像/アイコン（CC）取り扱い

##### TASL（Title/Author/Source/License）の記録

- [ ] `docs/legal/assets-credits.json`作成

```json
{
  "images": [
    {
      "title": "Hero Image",
      "author": "John Doe",
      "source": "https://unsplash.com/photos/abc123",
      "license": "CC BY 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by/4.0/"
    }
  ]
}
```

##### 表示箇所の方針

- **画像直下**: 短縮表記（例: "Photo by [Author] on [Source]"）
- **専用ページ**: `/legal/image-credits`に一括掲示

##### 既存アセットの棚卸し

- [ ] Figmaで使用中の画像/アイコンをリストアップ
- [ ] `public/images`フォルダのアセットを確認
- [ ] 不足TASLの回収（Unsplash/Pexels/アイコンサイト等）

#### 成果物

- `docs/legal/assets-credits.json` - 画像クレジット台帳
- `app/legal/image-credits/page.tsx` - 画像クレジットページ

---

### Phase 5: フォント（2週間）

**目的**: フォントライセンスの適切な管理

#### D. フォント

##### 利用フォントのライセンス棚卸し

- [ ] Google Fonts（Apache License 2.0 / OFL）
  - CDN利用 → UI表示不要
  - セルフホスト → LICENSE同梱
- [ ] カスタムフォント（商用ライセンス確認）

##### 運用方針の決定

- **CDN利用時**: UI表示不要（Googleがホスト）
- **バンドル配布時**: `public/fonts/LICENSE`同梱

##### フォントファイル同梱時の自動化

- [ ] `scripts/copy-font-licenses.ts`作成
- [ ] ビルド時に`public/fonts/*/LICENSE`を`dist/fonts/`にコピー

#### 成果物

- `docs/legal/font-licenses.md` - フォントライセンス方針
- `scripts/copy-font-licenses.ts` - ライセンス同梱スクリプト

---

### Phase 6: ベンダー独自EULA（2週間）

**目的**: 無料UIキット/アイコンのEULA順守

#### E. ベンダー独自EULA（無料UI/アイコン）

##### 各EULAの帰属表示/リンク義務の確認

- [ ] shadcn/ui → MIT License（帰属表示義務あり）
- [ ] Radix UI → MIT License
- [ ] Lucide Icons → ISC License
- [ ] その他UIキット/アイコンライブラリ

##### 必須表記の実装

- [ ] UI内クレジット（フッターの "Powered by …" 等）
- [ ] `/legal/oss-credits`に統合

##### 再配布/商用/編集可否の台帳化

- [ ] `docs/legal/vendor-eula.md`作成

#### 成果物

- `docs/legal/vendor-eula.md` - ベンダーEULA台帳
- フッターコンポーネント更新（必要な場合）

---

## 法務/ポリシー（共同）

### 第三者ライセンス/クレジット掲示ポリシー

#### 1. OSS（MIT/BSD/Apache）

- **基本ルール**: 著作権表示とライセンス文言を配布物に含める
- **NOTICE取り扱い**: Apache-2.0のNOTICEファイルは優先的に継承
- **表示場所**: `/legal/oss-credits`ページ + `THIRD_PARTY_NOTICES.txt`

#### 2. CC（クリエイティブ・コモンズ）

- **TASL要件**: Title/Author/Source/Licenseを明記
- **掲示場所の基準**:
  - 画像直下（短縮表記）
  - 専用ページ（`/legal/image-credits`）
- **CC0**: 帰属表示不要だが、推奨として記載

#### 3. フォント

- **CDN利用**: UI表示不要
- **セルフホスト**: LICENSEファイル同梱
- **商用フォント**: 個別確認（ライセンス契約書参照）

#### 4. ベンダーEULA

- **表記義務の判断フロー**:
  1. EULA原文を確認
  2. "attribution", "credit", "acknowledgment"の有無
  3. 必須ならUI内表記、推奨なら`/legal/oss-credits`
- **例外申請**: 法務承認が必要

#### 5. NGライセンス採用時のエスカレーション

- **AGPL/GPL**: 原則禁止（技術責任者承認が必要）
- **Commercial**: 法務確認必須
- **Unknown**: CIでブロック → 手動調査

---

## ドキュメント & 運用

### ディレクトリ構成

```
docs/legal/
├── LICENSE_COMPLIANCE_PLAN.md   # この文書
├── oss-inventory.md             # OSS棚卸しリスト
├── assets-inventory.md          # 画像/アイコン棚卸し
├── CREDITS.md                   # 第三者ライセンス詳細
├── assets-credits.json          # 画像クレジット台帳
├── font-licenses.md             # フォントライセンス方針
└── vendor-eula.md               # ベンダーEULA台帳

scripts/
├── generate-licenses.ts         # ライセンス自動生成
└── copy-font-licenses.ts        # フォントライセンス同梱

app/legal/
├── oss-credits/page.tsx         # OSSクレジットページ
└── image-credits/page.tsx       # 画像クレジットページ
```

### README更新

- [ ] ローカルでの生成コマンドを追記

```bash
# ライセンス情報を生成
npm run generate-licenses

# ライセンスチェック
npm run check-licenses
```

### リリース時のチェックリスト

- [ ] ライセンス生成成功（`npm run generate-licenses`）
- [ ] `/legal/oss-credits`ページ更新
- [ ] CIのライセンスチェックが通過
- [ ] 新規依存のライセンス確認済み

---

## サンプル：生成スクリプトの骨子（抜粋・イメージ）

### 依存の収集

```bash
npx license-checker --production --json > third_party/licenses.raw.json
```

### スクリプト（TypeScript）

```typescript
// scripts/generate-licenses.ts
import fs from 'fs'
import licenseChecker from 'license-checker'

interface LicenseInfo {
  licenses: string
  repository?: string
  licenseFile?: string
  publisher?: string
}

async function generateLicenses() {
  const licenses: Record<string, LicenseInfo> = await new Promise((resolve, reject) => {
    licenseChecker.init(
      {
        start: process.cwd(),
        production: true,
      },
      (err, packages) => {
        if (err) reject(err)
        else resolve(packages)
      }
    )
  })

  // Apache-2.0のNOTICEを抽出
  const notices: string[] = []
  const credits = Object.entries(licenses).map(([name, info]) => {
    if (info.licenses === 'Apache-2.0' && info.licenseFile) {
      const noticeFile = info.licenseFile.replace('LICENSE', 'NOTICE')
      if (fs.existsSync(noticeFile)) {
        notices.push(fs.readFileSync(noticeFile, 'utf8'))
      }
    }

    return {
      name,
      license: info.licenses,
      repository: info.repository,
      publisher: info.publisher,
    }
  })

  // JSON出力
  fs.writeFileSync('public/oss-credits.json', JSON.stringify(credits, null, 2))

  // NOTICE連結
  fs.writeFileSync('public/THIRD_PARTY_NOTICES.txt', notices.join('\n\n---\n\n'))

  console.log('✅ Licenses generated successfully')
}

generateLicenses()
```

### Next.jsページ

```tsx
// app/legal/oss-credits/page.tsx
import fs from 'fs'
import path from 'path'

interface Credit {
  name: string
  license: string
  repository?: string
  publisher?: string
}

export default async function OSSCreditsPage() {
  const creditsPath = path.join(process.cwd(), 'public/oss-credits.json')
  const data: Credit[] = JSON.parse(fs.readFileSync(creditsPath, 'utf8'))

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-8 text-3xl font-bold">Open Source Credits</h1>
      <p className="mb-4">This project uses the following open source software:</p>
      <div className="space-y-4">
        {data.map((credit) => (
          <div key={credit.name} className="rounded border p-4">
            <h2 className="text-xl font-semibold">{credit.name}</h2>
            <p className="text-muted-foreground text-sm">License: {credit.license}</p>
            {credit.repository && (
              <a href={credit.repository} className="text-primary underline" target="_blank" rel="noopener noreferrer">
                Repository
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 非機能要件

- **ビルド時間**: +30秒以内（目安）
- **ページ**: SSR/SSGで公開、サイト内検索に引っかかる
- **多言語対応**: v2で検討

---

## リスク/決めること

- [ ] MonoRepo下の複数パッケージ横断をどう集約するか
- [ ] ライセンス情報の欠損（レア）に対する手当（手動追記のルール）
- [ ] 画像の一括クレジット vs 個別表記の線引き
- [ ] 社内法務レビュープロセスの確立

---

## ロール & 期限

- **オーナー**: @<owner>
- **協力**: @legal @design @infra
- **期限**: YYYY-MM-DD

---

## 参考（運用ショートメモ）

- **CC BY**: TASLを満たせば場所は柔軟（画像直下/クレジットページ/脚注）
- **Apache-2.0**: NOTICE継承が肝
- **フォント**: 同梱時のみライセンス同梱、CDN参照はUI表示不要が多い
- **ベンダーEULA**: UI内クレジット義務の例あり—必ず原文確認

---

**最終更新**: 2025-10-14

---

**種類**: 📙 リファレンス
**最終更新**: 2025-12-11
**所有者**: BoxLog 開発チーム
