# 📊 統計機能 データ要件定義

## 📋 目次

1. [概要](#概要)
2. [設計アプローチ](#設計アプローチ)
3. [欲しいものリスト](#欲しいものリスト)
4. [利用可能なデータソース](#利用可能なデータソース)
5. [API実装計画](#api実装計画)

---

## 概要

BoxLogアプリの統計機能で表示すべきデータと、その実装要件を定義するドキュメントです。

### ステータス

- **作成日**: 2025-12-04
- **最終更新**: 2025-12-05
- **ステータス**: 🚧 要件定義中

---

## 設計アプローチ

### BoxLogのコンセプト

```
Plan（予定）= Googleカレンダー的
Record（実績）= Toggl的
Tag = 分類軸
```

### ユーザーが統計を見る動機

1. **進捗を把握したい** → 「ここまでやった」の確認
2. **積み上げを実感したい** → 累計、成長の可視化
3. **意思決定の精度を上げたい** → データに基づく判断

### アプローチ

**「ページ構成」ではなく「欲しいもの」から考える**

1. 欲しい統計コンポーネントをリストアップ
2. 作って使ってみる
3. 後からカテゴライズ（ページ分け）

### サイドバー

- グループ分けなし（フラットリスト）
- 中身が固まったら整理

---

## 欲しいものリスト

### 確定

| コンポーネント | 用途 | 優先度 |
|--------------|------|--------|
| 年次グリッド | 積み上げの可視化（GitHub風） | 高 |
| タグ別時間（棒グラフ） | 配分の把握、意思決定 | 高 |
| 累計時間 | 達成感 | 高 |
| 今月の時間 | 今の状況 | 中 |
| 前月比 | 変化の確認 | 中 |
| 連続日数 | 継続のモチベ（Duolingo的） | 高 |
| 時間帯別分布 | いつ作業しているか | 中 |
| 曜日別作業時間 | 曜日の傾向・習慣パターン | 中 |
| 月次トレンド | 月ごとの推移・成長確認 | 中 |

### 検討中

| コンポーネント | 用途 | 備考 |
|--------------|------|------|
| タグ別時間（円グラフ） | 割合の把握 | 棒グラフで十分かも |
| 予定 vs 実績 | 見積もり精度 | 必要性要検討 |

---

## 利用可能なデータソース

### 時間の計算

```sql
-- プランの所要時間
end_time - start_time = 所要時間

-- タグ別合計時間
SELECT tag_id, SUM(end_time - start_time) as total_hours
FROM plans
JOIN plan_tags ON plans.id = plan_tags.plan_id
WHERE start_time IS NOT NULL AND end_time IS NOT NULL
GROUP BY tag_id
```

### 実装済みテーブル

| テーブル | 説明 | 統計利用フィールド |
|---------|------|------------------|
| `plans` | プラン | status, created_at, start_time, end_time |
| `tags` | タグ | name, color |
| `plan_tags` | プラン-タグ紐付け | plan_id, tag_id |
| `plan_activities` | 変更履歴 | action_type, created_at |

### ステータス体系

```
todo → doing → done
```

---

## API実装計画

### 必要なエンドポイント

```typescript
// 年次グリッド用
plans.getDailyHours       // ✅ 実装済み

// タグ別時間用
plans.getTimeByTag        // ✅ 実装済み

// サマリー用（統合エンドポイント）
plans.getSummary          // ✅ 実装済み（累計時間・今月時間・前月比・完了タスク数）

// 連続日数用
plans.getStreak           // ✅ 実装済み（現在連続日数・最長記録・今日のアクティビティ・年間アクティブ日数）

// 時間帯別分布用
plans.getHourlyDistribution  // ✅ 実装済み（3時間区切りの作業時間分布）

// 曜日別分布用
plans.getDayOfWeekDistribution  // ✅ 実装済み（月曜始まりの曜日別作業時間）

// 月次トレンド用
plans.getMonthlyTrend  // ✅ 実装済み（過去12ヶ月の月別作業時間）
```

---

## 決定事項

### ✅ Self Analysis系は統計から分離

**方針**: Self Analysis系は **Settings > Personalization** に移動

| 移動先 | 項目 |
|--------|------|
| Settings > Personalization | Goals, Principles, Value, Life Vision, Identity, Purpose, AntiValues |

**理由**:
- 統計 = 数値データの可視化
- Self Analysis = ユーザー情報の言語化
- コンテキストが異なる

### ✅ 不要なページは削除

- `/stats/reflect/*`
- `/stats/act/*`
- `/stats/connpass`
- その他旧ページ

---

## 次のステップ

- [x] 設計アプローチの決定（欲しいものベース）
- [x] Self Analysis系 → Settings へ移動決定
- [x] 年次グリッドの実装（`YearlyHeatmap`コンポーネント）
- [x] タグ別時間の実装（`TagTimeChart`コンポーネント）
- [x] サマリー（累計・今月・前月比）の実装（`StatsSummary`コンポーネント）
- [x] 連続日数の実装（`StreakCard`コンポーネント）
- [x] 時間帯別分布の実装（`HourlyDistributionChart`コンポーネント）
- [x] 曜日別作業時間の実装（`DayOfWeekChart`コンポーネント）
- [x] 月次トレンドの実装（`MonthlyTrendChart`コンポーネント）
- [ ] ページ構成の決定（実装後）

---

**最終更新**: 2025-12-05
**ステータス**: 🚧 要件定義中

---

**種類**: 📕 解説
**最終更新**: 2025-12-11
**所有者**: BoxLog 開発チーム
