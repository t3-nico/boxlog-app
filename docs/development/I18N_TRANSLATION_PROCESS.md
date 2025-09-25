# 翻訳依頼・管理プロセス

BoxLogアプリケーションにおける翻訳の依頼、管理、品質保証の完全なプロセスドキュメントです。

## 🎯 プロセス概要

### 翻訳フロー

```
新機能開発 → 翻訳キー作成 → 翻訳依頼 → 翻訳作業 → レビュー → 品質確認 → リリース
```

### 関係者・役割

- **開発者**: 翻訳キーの設計・実装
- **プロジェクトマネージャー**: 翻訳依頼の管理
- **翻訳者**: 翻訳作業の実行
- **レビューアー**: 翻訳品質の確認
- **QAエンジニア**: 最終品質確認

## 📋 翻訳依頼プロセス

### 1. 事前準備

#### 1.1 翻訳要件の明確化

```markdown
## 翻訳依頼書テンプレート

### プロジェクト情報

- **プロジェクト名**: BoxLog Web App
- **機能名**: [機能名を記載]
- **リリース予定日**: YYYY/MM/DD
- **優先度**: 高/中/低

### 翻訳範囲

- **対象言語**: 英語 → 日本語 / 日本語 → 英語
- **文字数**: 約XXX文字
- **翻訳キー数**: XXXキー

### コンテキスト情報

- **ターゲットユーザー**: [ユーザー層の説明]
- **使用場面**: [機能の使用場面説明]
- **トーン・文体**: フォーマル/カジュアル/技術的

### 参考資料

- 既存の翻訳ガイドライン
- UIスクリーンショット
- 機能仕様書
```

#### 1.2 翻訳キー準備チェックリスト

- [ ] 翻訳キーがガイドラインに準拠している
- [ ] 英語版の原文が確定している
- [ ] 変数補間が適切に設計されている
- [ ] コンテキスト情報が十分である
- [ ] スクリーンショット・説明資料が準備できている

### 2. 翻訳依頼の実行

#### 2.1 依頼書の作成

```typescript
// translation-request.json
{
  "requestId": "TR-2024-001",
  "project": "BoxLog Web App",
  "feature": "User Authentication",
  "requestDate": "2024-01-15",
  "deadline": "2024-01-22",
  "priority": "high",
  "translator": {
    "primary": "translator@example.com",
    "backup": "backup@example.com"
  },
  "languages": {
    "source": "en",
    "target": ["ja"]
  },
  "deliverables": [
    {
      "file": "auth.json",
      "keyCount": 25,
      "estimatedChars": 500
    }
  ]
}
```

#### 2.2 翻訳パッケージの準備

```bash
# 翻訳依頼パッケージの作成
mkdir translation-request-TR-2024-001/
├── request.json           # 依頼書
├── source/               # 原文ファイル
│   └── auth-en.json
├── context/              # コンテキスト資料
│   ├── screenshots/      # UIスクリーンショット
│   ├── wireframes/       # ワイヤーフレーム
│   └── specifications/   # 仕様書
├── reference/            # 参考資料
│   ├── glossary.json     # 用語集
│   ├── style-guide.md    # スタイルガイド
│   └── previous-translations/ # 過去の翻訳例
└── template/             # 翻訳テンプレート
    └── auth-ja.json
```

## 🔄 翻訳作業プロセス

### 1. 翻訳者への作業依頼

#### 1.1 初回ブリーフィング

```markdown
## ブリーフィング内容

### プロジェクト背景

- BoxLogはタスク管理アプリケーション
- B2B向け、ビジネスユーザーがターゲット
- シンプル・直感的な操作性を重視

### 翻訳方針

- **一貫性**: 既存の翻訳との統一性を保つ
- **自然性**: 日本語として自然な表現
- **簡潔性**: 分かりやすく簡潔な表現
- **専門性**: 必要に応じて適切な専門用語を使用

### 注意事項

- UI制約: ボタンテキストは15文字以内
- 変数部分（{{variable}}）は変更しない
- 既存の用語集に準拠する
- 疑問点は必ず確認を取る
```

#### 1.2 用語集の提供

```json
// glossary.json
{
  "terminology": {
    "en": {
      "task": "タスク",
      "project": "プロジェクト",
      "dashboard": "ダッシュボード",
      "settings": "設定",
      "profile": "プロフィール",
      "calendar": "カレンダー",
      "notification": "通知",
      "workspace": "ワークスペース",
      "template": "テンプレート",
      "archive": "アーカイブ"
    }
  },
  "styleGuide": {
    "honorifics": "基本的に敬語は使用しない（シンプル・直接的な表現）",
    "numbers": "数字は半角、単位は全角",
    "punctuation": "句点は使用しない（UIテキスト）",
    "consistency": "同一機能内では表現を統一"
  }
}
```

### 2. 翻訳作業の管理

#### 2.1 進捗管理

```typescript
// translation-progress.json
{
  "requestId": "TR-2024-001",
  "status": "in-progress",
  "progress": {
    "total": 25,
    "translated": 18,
    "reviewed": 12,
    "approved": 10
  },
  "timeline": {
    "started": "2024-01-16T09:00:00Z",
    "estimatedCompletion": "2024-01-20T17:00:00Z",
    "actualCompletion": null
  },
  "quality": {
    "accuracy": 95,
    "consistency": 98,
    "naturalness": 92
  }
}
```

#### 2.2 品質チェックポイント

```markdown
## 中間チェック（50%完了時）

### 確認項目

- [ ] 用語集への準拠
- [ ] 翻訳方針の理解度
- [ ] UI制約の遵守
- [ ] 変数部分の保持

### フィードバック

- 良い点：[具体的な良い翻訳例]
- 改善点：[修正が必要な箇所]
- 提案：[より良い翻訳への提案]
```

## 📝 レビュープロセス

### 1. 翻訳レビューの段階

#### Level 1: 自己チェック（翻訳者）

```markdown
## 自己チェック項目

- [ ] 原文の意味を正確に伝えているか
- [ ] 日本語として自然な表現か
- [ ] 用語集に準拠しているか
- [ ] UI制約を守っているか
- [ ] 変数部分を変更していないか
- [ ] 既存翻訳との一貫性があるか
```

#### Level 2: ピアレビュー（他の翻訳者）

```markdown
## ピアレビュー観点

### 言語品質

- 翻訳の正確性
- 自然な日本語表現
- 文体・トーンの一貫性

### 機能理解

- コンテキストの理解
- ユーザビリティへの配慮
- ブランドイメージとの整合性

### 技術的正確性

- 専門用語の適切性
- UI制約の遵守
- 変数・フォーマットの保持
```

#### Level 3: 最終レビュー（プロジェクトマネージャー）

```markdown
## 最終レビュー項目

### ビジネス要件

- [ ] プロジェクト要件を満たしているか
- [ ] ターゲットユーザーに適切か
- [ ] ブランドイメージと一致するか

### 品質基準

- [ ] 翻訳品質基準をクリアしているか
- [ ] 一貫性が保たれているか
- [ ] UI/UXに問題はないか

### 実装準備

- [ ] ファイル形式が正しいか
- [ ] 文字エンコーディングが適切か
- [ ] 実装に必要な情報が揃っているか
```

### 2. レビューツール・テンプレート

#### 2.1 レビューコメント形式

```markdown
## レビューコメント テンプレート

**ファイル**: auth.json
**キー**: auth.login.title
**原文**: Sign In
**翻訳**: ログイン

### 評価

- **正確性**: ⭐⭐⭐⭐⭐
- **自然性**: ⭐⭐⭐⭐⭐
- **一貫性**: ⭐⭐⭐⭐⭐

### コメント

適切な翻訳です。既存のUIと一貫性があります。

### アクション

- [x] 承認
- [ ] 修正必要
- [ ] 再検討
```

#### 2.2 修正依頼フォーマット

```markdown
## 修正依頼

**修正ID**: FIX-001
**キー**: auth.register.agreeTerms
**現在の翻訳**: 「利用規約とプライバシーポリシーに同意します」

### 問題点

チェックボックスのラベルとしては長すぎる（UI制約違反）

### 修正案

「利用規約に同意する」

### 理由

- UI制約（20文字以内）を満たす
- 必要最小限の情報を含む
- 法的要件を満たす

### 期限

2024-01-18 17:00
```

## 🎯 品質保証システム

### 1. 品質指標

#### 翻訳品質KPI

```typescript
interface TranslationQuality {
  accuracy: number // 正確性 (90%以上)
  naturalness: number // 自然性 (85%以上)
  consistency: number // 一貫性 (95%以上)
  completeness: number // 完成度 (100%)
  uiCompliance: number // UI制約遵守 (100%)
}

// 品質基準
const qualityStandards: TranslationQuality = {
  accuracy: 90,
  naturalness: 85,
  consistency: 95,
  completeness: 100,
  uiCompliance: 100,
}
```

### 2. 品質チェック自動化

#### 2.1 自動チェックスクリプト

```javascript
// scripts/translation-quality-check.js
const checkTranslationQuality = (sourceFile, targetFile) => {
  const checks = {
    keyConsistency: checkKeyConsistency(sourceFile, targetFile),
    variableIntegrity: checkVariableIntegrity(sourceFile, targetFile),
    lengthConstraints: checkLengthConstraints(targetFile),
    terminologyConsistency: checkTerminology(targetFile),
    encodingValid: checkEncoding(targetFile),
  }

  return {
    passed: Object.values(checks).every((check) => check.passed),
    details: checks,
  }
}
```

#### 2.2 CI/CDパイプライン統合

```yaml
# .github/workflows/translation-check.yml
name: Translation Quality Check
on:
  pull_request:
    paths:
      - 'src/lib/i18n/dictionaries/**'

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run translation quality check
        run: node scripts/translation-quality-check.js

      - name: Run translation tests
        run: npm run test:i18n

      - name: Check UI constraints
        run: node scripts/check-ui-constraints.js
```

## 📊 納品・実装プロセス

### 1. 納品物チェックリスト

#### 翻訳ファイル

- [ ] JSON形式で提供されている
- [ ] UTF-8エンコーディング
- [ ] 構文エラーがない
- [ ] 全ての翻訳キーが存在する
- [ ] 変数部分が保持されている

#### ドキュメント

- [ ] 翻訳メモ・注意事項
- [ ] 用語集の更新
- [ ] 変更ログ
- [ ] 品質レポート

### 2. 実装前検証

#### 2.1 技術的検証

```bash
# 翻訳ファイルの検証
npm run i18n:validate

# UI制約チェック
npm run i18n:check-constraints

# 表示テスト
npm run i18n:preview
```

#### 2.2 ユーザビリティ検証

```markdown
## UI確認項目

- [ ] ボタンテキストが適切なサイズで表示される
- [ ] 改行位置が自然である
- [ ] アイコンとテキストのバランスが良い
- [ ] 複数行にまたがる場合の表示が適切

## 機能確認項目

- [ ] 翻訳された状態で機能が正常に動作する
- [ ] エラーメッセージが適切に表示される
- [ ] フォームバリデーションが動作する
- [ ] 言語切り替えがスムーズに行われる
```

### 3. リリース後フォロー

#### 3.1 ユーザーフィードバック収集

```typescript
// フィードバック収集システム
interface TranslationFeedback {
  keyPath: string
  currentTranslation: string
  suggestedTranslation?: string
  issue: 'accuracy' | 'naturalness' | 'length' | 'context'
  userType: 'end-user' | 'internal' | 'beta-tester'
  priority: 'low' | 'medium' | 'high'
}

// フィードバック例
const feedback: TranslationFeedback = {
  keyPath: 'dashboard.tasks.create',
  currentTranslation: 'タスクを作成',
  suggestedTranslation: '新しいタスク',
  issue: 'naturalness',
  userType: 'end-user',
  priority: 'medium',
}
```

#### 3.2 継続改善プロセス

```markdown
## 月次翻訳品質レビュー

### 収集データ

- ユーザーフィードバック件数・内容
- サポート問い合わせの言語関連割合
- A/Bテスト結果（翻訳パターン比較）

### 改善アクション

1. **高頻度フィードバック**: 即座に修正検討
2. **UI制約違反**: 次回アップデートで修正
3. **一貫性問題**: 用語集・ガイドライン更新
4. **新規要望**: Phase 2/3計画に反映

### レポーティング

- 翻訳品質スコアの推移
- 修正対応件数・時間
- ユーザー満足度の変化
- 次期改善計画
```

## 🔧 ツール・リソース

### 1. 推奨ツール

#### 翻訳支援ツール

- **Lokalise**: クラウド翻訳管理
- **Crowdin**: コミュニティ翻訳
- **Weblate**: オープンソース翻訳プラットフォーム

#### 品質管理ツール

- **DeepL**: 機械翻訳品質チェック
- **Grammarly**: 英語文法チェック
- **校正ツール**: 日本語校正支援

#### コラボレーション

- **Slack**: リアルタイムコミュニケーション
- **GitHub**: バージョン管理・レビュー
- **Notion**: プロジェクト管理・ドキュメント共有

### 2. テンプレート集

#### 依頼関連

- 翻訳依頼書テンプレート
- ブリーフィング資料テンプレート
- 進捗レポートテンプレート

#### レビュー関連

- レビューコメントテンプレート
- 品質評価シートテンプレート
- 修正依頼フォーマット

#### 管理関連

- プロジェクト管理テンプレート
- 品質レポートテンプレート
- ふりかえりテンプレート

## 📈 成功指標・KPI

### 翻訳プロセスKPI

- **納期遵守率**: 95%以上
- **品質基準達成率**: 90%以上
- **修正回数**: 平均2回以下
- **レビュー工数**: 翻訳工数の30%以下

### ユーザー満足度KPI

- **言語関連サポート問い合わせ**: 全体の5%以下
- **翻訳品質満足度**: 4.0/5.0以上
- **言語切り替え使用率**: 30%以上（日本語ユーザー）

### ビジネス影響KPI

- **多言語ユーザー増加率**: 月次10%以上
- **国際市場からの売上比率**: 30%以上
- **翻訳ROI**: 投資額の200%以上

---

このプロセスに従って翻訳を管理することで、BoxLogアプリケーションの国際化品質を高く保ち、効率的な多言語展開を実現できます。
