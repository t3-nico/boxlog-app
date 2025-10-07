# Phase 2 高度国際化機能実装ガイド

BoxLogアプリケーションのPhase 2では、企業レベルの高度な国際化機能を実装しました。

## 🎯 Phase 2の範囲と成果

### 実装完了済み Issue

- **✅ Issue #275**: RTL（右→左）言語対応の基盤実装
- **✅ Issue #276**: 複数形処理の高度化
- **✅ Issue #277**: 日付・時刻フォーマットの地域対応
- **✅ Issue #278**: 数値・通貨フォーマットの地域対応

## 🏗️ 実装されたシステム

### 1. RTL言語サポートシステム

**ファイル**: `/src/lib/i18n/rtl.ts`, `/src/lib/i18n/hooks.ts`

#### 主要機能

- 方向対応のCSS クラス生成
- RTL対応のReactフック
- 自動的なlayout方向設定
- 包括的なスタイル調整

#### 使用例

```typescript
// RTL状態の取得
import { useRTL } from '@/lib/i18n/hooks'

const MyComponent = () => {
  const { isRTL, direction, locale } = useRTL()

  return (
    <div className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={isRTL ? 'ml-4' : 'mr-4'}>Content</div>
    </div>
  )
}
```

#### 対応言語（将来実装予定）

- アラビア語 (ar)
- ヘブライ語 (he)
- ペルシャ語 (fa)
- ウルドゥー語 (ur)

### 2. 複数形処理システム（ICU準拠）

**ファイル**: `/src/lib/i18n/pluralization.ts`

#### 主要機能

- CLDR準拠の複数形カテゴリー
- ICU Message Format対応
- 言語固有の複数形ルール
- 専用ヘルパー関数群

#### 使用例

```typescript
import { pluralizeWithVariables, formatTimeUnit } from '@/lib/i18n/pluralization'

// オブジェクト形式の複数形
const taskTranslations = {
  zero: 'no tasks',
  one: '1 task',
  other: '{{count}} tasks',
}
pluralizeWithVariables('en', 5, taskTranslations) // "5 tasks"

// ICU形式
formatICUPlural('en', 3, 'You have {count, plural, one {# task} other {# tasks}}')
// "You have 3 tasks"

// 時間単位専用
formatTimeUnit('ja', 30, 'minute') // "30分"
```

#### サポートされる複数形ルール

- **英語**: one/other
- **日本語**: other（単複区別なし）
- **アラビア語**（将来）: zero/one/two/few/many/other
- **ロシア語**（将来）: one/few/many

### 3. 日付・時刻地域対応システム

**ファイル**: `/src/lib/i18n/date-time.ts`

#### 主要機能

- Intl.DateTimeFormat完全活用
- 地域別設定（週開始日、AM/PM）
- 相対時刻表示
- 日付範囲フォーマット

#### 使用例

```typescript
import { formatDate, formatRelativeTime, formatDuration } from '@/lib/i18n/date-time'

// 基本的な日付フォーマット
formatDate(new Date(), 'ja', 'medium') // "2024年1月15日"
formatDate(new Date(), 'en', 'medium') // "Jan 15, 2024"

// 相対時刻
formatRelativeTime(pastDate, 'en') // "2 hours ago"
formatRelativeTime(pastDate, 'ja') // "2時間前"

// 期間フォーマット
formatDuration(7200000, 'en', ['hour', 'minute']) // "2 hours"
formatDuration(7200000, 'ja', ['hour', 'minute']) // "2時間"
```

#### 地域別設定

- **週開始日**: アメリカ（日曜）、ヨーロッパ（月曜）
- **時刻表示**: アメリカ（12時間制）、日本（24時間制）
- **週末日**: 地域に応じた設定

### 4. 数値・通貨地域対応システム

**ファイル**: `/src/lib/i18n/number-currency.ts`

#### 主要機能

- 多通貨対応フォーマット
- 地域別デフォルト通貨
- 専用フォーマット（ファイルサイズ、電話番号等）
- 価格範囲・割引表示

#### 使用例

```typescript
import { formatCurrency, formatFileSize, formatPhoneNumber } from '@/lib/i18n/number-currency'

// 通貨フォーマット
formatCurrency(1234.56, 'en', 'USD') // "$1,234.56"
formatCurrency(1234, 'ja', 'JPY') // "¥1,234"

// ファイルサイズ
formatFileSize(1048576, 'en', true) // "1.0 MiB"
formatFileSize(1048576, 'ja', true) // "1.0MiB"

// 電話番号
formatPhoneNumber('1234567890', 'en-US') // "(123) 456-7890"
formatPhoneNumber('0312345678', 'ja') // "03-1234-5678"
```

#### サポート通貨

- USD（アメリカドル）
- JPY（日本円）
- EUR（ユーロ）
- GBP（英ポンド）
- CNY（中国元）
- KRW（韓国ウォン）

## 🔧 統合システム

### 拡張翻訳関数

Phase 2では、基本翻訳関数を拡張して複数形処理を統合しました：

```typescript
// Phase 1: 基本翻訳関数
const t = createTranslation(dictionary, locale)
t('welcome', { name: 'ユーザー' }) // "こんにちは、ユーザーさん"

// Phase 2: 複数形対応
t.plural('tasks', 5) // 複数形処理
t.icu('{count, plural, one {# task} other {# tasks}}', 5) // ICU形式
```

### React Hooks統合

```typescript
import { useRTL, useDirectionalClasses } from '@/lib/i18n/hooks'

const MyComponent = () => {
  const { isRTL, direction } = useRTL()
  const classes = useDirectionalClasses()

  return (
    <div className={classes.textAlign}>
      <span className={classes.marginStart('4')}>Content</span>
    </div>
  )
}
```

## 📊 品質保証

### テストカバレッジ

全ての機能に対して包括的なテストを実装：

```bash
# RTLサポートテスト
src/lib/i18n/__tests__/rtl.test.ts

# 複数形処理テスト
src/lib/i18n/__tests__/pluralization.test.ts

# 日付時刻フォーマットテスト
src/lib/i18n/__tests__/date-time.test.ts

# 数値通貨フォーマットテスト
src/lib/i18n/__tests__/number-currency.test.ts
```

### テスト項目

- ✅ 正常ケース
- ✅ 境界値テスト
- ✅ エラーハンドリング
- ✅ フォールバック機能
- ✅ 無効値処理

## 🚀 パフォーマンス最適化

### 動的インポート

```typescript
// 必要時のみ読み込み
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  ja: () => import('./dictionaries/ja.json').then((m) => m.default),
}
```

### メモ化対応

```typescript
// RTLフック内での自動メモ化
const useDirectionalClasses = () => {
  const { isRTL } = useRTL()

  return useMemo(
    () => ({
      textAlign: isRTL ? 'text-right' : 'text-left',
      marginStart: (value: string) => (isRTL ? `mr-${value}` : `ml-${value}`),
    }),
    [isRTL]
  )
}
```

## 🛡️ エラーハンドリング

### 自動フォールバック

全ての関数で無効なロケールに対する自動フォールバック機能を実装：

```typescript
try {
  return new Intl.DateTimeFormat(locale, options).format(date)
} catch (error) {
  console.warn(`Date formatting failed for locale ${locale}:`, error)
  return new Intl.DateTimeFormat('en-US', options).format(date)
}
```

## 📈 使用メトリクス

### Phase 2で追加された機能

- **ファイル数**: 8ファイル追加
- **テストファイル**: 4ファイル追加
- **関数数**: 100+関数実装
- **型定義**: 50+インターフェース定義
- **言語サポート拡張**: 将来のRTL言語準備完了

## 🔮 将来の展開（Phase 3予定）

### 残りのIssue（34件）

Phase 2完了により、以下が今後実装予定：

- **言語追加**: 中国語、韓国語、スペイン語
- **フォントシステム**: Noto Sans等国際フォント
- **翻訳管理**: 自動翻訳・翻訳管理システム
- **A/Bテスト**: 翻訳パターンテスト
- **CDN最適化**: 地域別配信最適化

### 技術的拡張

- WebAssembly活用の高速処理
- Service Worker翻訳キャッシュ
- オフライン翻訳対応
- AI翻訳品質向上

---

## 🎯 Phase 2の成果総括

Phase 2により、BoxLogは**企業レベルの国際化システム**を完全装備しました：

### ✅ 実現した機能

1. **RTL言語完全対応準備**
2. **ICU準拠の複数形処理**
3. **地域対応の日付時刻システム**
4. **多通貨対応の数値フォーマット**

### ✅ 技術的品質

1. **完全型安全** - TypeScript厳密型定義
2. **包括的テスト** - 境界値・エラーケース網羅
3. **自動フォールバック** - エラー時の安全性確保
4. **パフォーマンス最適化** - 遅延読み込み・メモ化

BoxLogは現在、グローバル企業での運用に完全対応できる国際化基盤を持っています。
