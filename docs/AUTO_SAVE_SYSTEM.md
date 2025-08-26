# 自動保存 + トースト通知システム

## 概要
すべての設定を自動保存し、保存完了時にトースト通知でユーザーにフィードバックを提供する統一システム

## 実装内容

### 1. useAutoSaveSettings Hook
**ファイル**: `/src/features/settings/hooks/useAutoSaveSettings.ts`

**主な機能:**
- 設定値の変更を自動検知
- デバウンス処理（1秒後に自動保存）
- 変更検知による無駄なAPI呼び出し防止
- 保存中状態の管理
- 成功・エラー時のトースト通知

**使用例:**
```typescript
const profile = useAutoSaveSettings({
  initialValues: {
    displayName: '',
    email: '',
    timezone: 'Asia/Tokyo',
  },
  onSave: async (values) => {
    await fetch('/api/settings/profile', {
      method: 'POST',
      body: JSON.stringify(values)
    })
  },
  successMessage: 'プロフィールを更新しました',
  debounceMs: 1000
})

// 使用方法
profile.updateValue('displayName', '新しい名前')
profile.updateValues({ email: 'new@email.com', timezone: 'UTC' })
```

### 2. 強化されたSettingsCard
**ファイル**: `/src/features/settings/components/SettingsCard.tsx`

**新機能:**
- `isSaving`プロパティで保存中表示
- 保存中のボーダー色変更（青色でハイライト）
- ローディングスピナー + "保存中..."テキスト
- アクションボタンとの共存

**使用例:**
```tsx
<SettingsCard
  title="プロフィール設定"
  description="基本情報の管理"
  isSaving={profile.isSaving}
>
  {/* 設定フィールド */}
</SettingsCard>
```

### 3. SettingField共通コンポーネント
**ファイル**: `/src/features/settings/components/fields/SettingField.tsx`

**機能:**
- ラベル、説明、必須マークの統一表示
- config/theme完全準拠
- 一貫したスペーシング

**使用例:**
```tsx
<SettingField 
  label="表示名"
  description="他のユーザーに表示される名前"
  required
>
  <Input
    value={profile.values.displayName}
    onChange={(e) => profile.updateValue('displayName', e.target.value)}
  />
</SettingField>
```

### 4. 実装例（AccountSettingsAutoSave）
**ファイル**: `/src/features/settings/components/examples/AccountSettingsAutoSave.tsx`

**実装した設定項目:**
- プロフィール設定（表示名、メール、タイムゾーン、言語）
- プライバシー設定（公開設定、通知許可）
- デバッグ情報表示

**特徴:**
- 複数の設定グループを独立して自動保存
- 異なるAPIエンドポイントへの保存
- カスタム成功メッセージ
- Switch、Input、Selectの統合使用例

## システムアーキテクチャ

### データフロー
```
[UI Input] → [updateValue] → [State Change] → [Debounced Save] → [API Call] → [Toast Notification]
     ↓
[isSaving State] → [UI Feedback]
```

### デバウンス処理
- **目的**: 連続入力時の無駄なAPI呼び出し防止
- **実装**: カスタムdebounce関数（lodash不使用）
- **デフォルト**: 1000ms（1秒）
- **キャンセル機能**: コンポーネントアンマウント時

### 変更検知
- **方式**: JSON.stringify比較
- **効果**: 同一値の再保存防止
- **最適化**: lastSavedValuesでキャッシュ管理

## UXの特徴

### ✅ シンプルなUX
- 保存ボタン不要
- ユーザーは設定変更に集中
- 保存忘れの心配なし

### ✅ 明確なフィードバック
- トースト通知で保存確認
- 保存中の視覚的表示
- エラー時の適切な通知

### ✅ パフォーマンス最適化
- デバウンスで無駄なAPI呼び出し防止
- 変更検知で同じ値の再保存防止
- 非同期処理でUIブロック回避

## テストページ
**URL**: `/settings/test-autosave`
**機能**: 自動保存システムの動作確認とデバッグ

## 使用されるトーストシステム
**実装**: カスタムToastProvider（`/src/components/shadcn-ui/toast.tsx`）
**利用メソッド**: `success()`, `error()`
**表示位置**: 画面下部
**自動消去**: 成功2秒、エラー4秒

## 技術的詳細

### TypeScript型安全性
- ジェネリクス`<T>`による型推論
- keyof演算子による安全なプロパティアクセス
- 完全な型チェック

### パフォーマンス考慮
- useCallback/useMemoによる再レンダリング最適化
- useRefによる値の永続化
- cleanup関数による適切なリソース解放

### エラーハンドリング
- try-catch による例外捕捉
- Error インスタンスの型ガード
- ユーザーフレンドリーなエラーメッセージ

## 今後の拡張予定

### 1. オフライン対応
- ネットワーク切断時のキューイング
- 再接続時の自動同期

### 2. 競合解決
- 同時編集時の競合検知
- マージ戦略の実装

### 3. 履歴機能
- 変更履歴の記録
- アンドゥ・リドゥ機能

## 実装日
2025-08-26

## ファイル一覧

### 新規作成
- `/src/features/settings/hooks/useAutoSaveSettings.ts`
- `/src/features/settings/components/fields/SettingField.tsx`
- `/src/features/settings/components/examples/AccountSettingsAutoSave.tsx`
- `/src/app/(app)/settings/test-autosave/page.tsx`

### 更新
- `/src/features/settings/components/SettingsCard.tsx` (isSaving対応)
- `/src/features/settings/components/index.ts` (エクスポート追加)

## 関連イシュー
- 設定の自動保存システム実装
- ユーザビリティ向上
- トースト通知統合