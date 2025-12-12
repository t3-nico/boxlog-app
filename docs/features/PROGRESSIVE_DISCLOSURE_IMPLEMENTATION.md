# プログレッシブ開示式イベント作成フォーム実装ドキュメント

## 概要

BoxLogアプリのイベント作成フォームに**2択式プログレッシブ開示**を実装し、素早いタスク入力から詳細な予定作成まで対応できるUIに改修。

## 実装内容

### ✅ 1. 2択式ラジオボタンUI

**従来**: 4択ドロップダウン（後で決める・時間指定・今日中・明日）
**改修後**: 2択ラジオボタン（後で決める・今すぐ予定する）

```tsx
// ラジオボタン実装例
<div className="flex gap-4">
  <label className={`...border-2 ${scheduleMode === 'defer' ? 'border-blue-500' : ''}`}>
    <input type="radio" name="scheduleMode" value="defer" />
    <div className="custom-radio-indicator">後で決める</div>
  </label>
  <label className={`...border-2 ${scheduleMode === 'schedule' ? 'border-blue-500' : ''}`}>
    <input type="radio" name="scheduleMode" value="schedule" />
    <div className="custom-radio-indicator">今すぐ予定する</div>
  </label>
</div>
```

### ✅ 2. プログレッシブ開示の最適化

**「後で決める」モード**:

- タイトル + タグのみの最速入力
- 余計なフィールド（推定時間・優先度）を削除

**「今すぐ予定する」モード**:

- タイトル + タグ + 日時フィールド
- 200msの高速アニメーション

```tsx
<AnimatePresence>
  {scheduleMode === 'schedule' && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="border-t border-neutral-200 pt-4"
    >
      <DateSelector />
    </motion.div>
  )}
</AnimatePresence>
```

### ✅ 3. 高速入力モード

**Cmd+Enter** で高速連続入力モードに移行:

- モーダルを閉じずにフォームリセット
- 自動でタイトルフィールドにフォーカス
- "Fast Mode"バッジ表示

```tsx
// 高速入力モードの実装
const [fastInputMode, setFastInputMode] = useState(false)

if (isQuickInput && fastInputMode) {
  // フォームリセット & フォーカス復帰
  setTitle('')
  setTags([])
  setTimeout(() => {
    titleInput?.focus()
  }, 100)
}
```

### ✅ 4. キーボードショートカット

| キー        | 動作                       |
| ----------- | -------------------------- |
| `1`         | 「後で決める」選択         |
| `2`         | 「今すぐ予定する」選択     |
| `Tab/Space` | モード切り替え             |
| `Enter`     | 「後で決める」で即座に保存 |
| `Cmd+Enter` | 高速入力モード有効化       |

### ✅ 5. データ処理の最適化

```tsx
// 2択モードに応じてデータを整形
if (scheduleMode === 'schedule') {
  // 今すぐ予定するモード
  saveData.date = date
  saveData.endDate = endDate
  saveData.status = 'scheduled'
} else {
  // 後で決めるモード
  saveData.date = null
  saveData.endDate = null
  saveData.status = 'backlog'
}
```

## UX改善効果

### 🚀 最速入力の実現

- 「後で決める」: タイトル→Enter で即座に作成
- 10個連続タスクの高速入力が可能

### 🎯 迷いの排除

- 4択 → 2択で選択肢を大幅削減
- ラジオボタンで視覚的に分かりやすく

### ⌨️ キーボード最適化

- 数字キー・矢印キーでの直感的操作
- マウスを使わない完全キーボード操作

## 技術仕様

### ファイル構成

- `EssentialSingleView.tsx` - メインフォームコンポーネント
- `CreateEventModal.tsx` - モーダルコントローラー
- `EssentialEditView.tsx` - 編集モード（統一UI）

### 状態管理

```tsx
type ScheduleMode = 'defer' | 'schedule'
const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('defer')
const [fastInputMode, setFastInputMode] = useState(false)
```

### LocalStorage連携

```tsx
// 選択状態の保存・復元
localStorage.setItem('boxlog-create-mode', mode)
const saved = localStorage.getItem('boxlog-create-mode')
```

## 互換性

### 既存データとの互換性

- `date: null` → backlogステータス
- `date: Date` → scheduledステータス
- 既存の編集機能も同じUIで統一

### アクセシビリティ

- `sr-only`でスクリーンリーダー対応
- カスタムラジオボタンのARIA対応
- キーボードナビゲーション完全対応

## 今後の拡張可能性

### AI自動スケジュール機能

「後で決める」タスクを自動的に最適な時間にスケジュール

### ビュー別デフォルト

- カレンダービュー → 「今すぐ予定する」
- タスクリスト → 「後で決める」

### バッチ処理機能

複数タスクの一括時間設定

---

**実装期間**: 2025-08-27
**開発者**: Claude Code
**バージョン**: v1.0
**テスト環境**: http://localhost:3007

---

**最終更新**: 2025-09-18

---

**種類**: 📕 解説
**最終更新**: 2025-12-11
**所有者**: BoxLog 開発チーム
