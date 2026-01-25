# Model Selection Guidelines

BoxLogプロジェクトでのSubagentモデル選択ガイドライン。

## モデル選択の原則

```
Haiku (高速・低コスト) ──▶ Sonnet (バランス) ──▶ Opus (高精度)
     $0.25/$1.25              $3/$15               $15/$75
```

## タスク別モデル推奨

### Haiku を使うべきタスク

| タスク                   | 理由                     |
| ------------------------ | ------------------------ |
| ファイル検索・Grep       | 単純なパターンマッチング |
| 簡単な質問への回答       | コンテキスト不要         |
| ドキュメント調査         | 情報収集のみ             |
| コード整形・フォーマット | 機械的な変換             |
| 単体テストの生成         | パターン化された作業     |

**Subagent定義例:**

```yaml
subagent_type: Explore
model: haiku
```

### Sonnet を使うべきタスク（デフォルト）

| タスク            | 理由               |
| ----------------- | ------------------ |
| 通常のコード実装  | バランスの良い判断 |
| バグ修正          | 文脈理解が必要     |
| リファクタリング  | パターン認識       |
| コードレビュー    | 品質チェック       |
| 2-4ファイルの変更 | 中程度の複雑さ     |

**Subagent定義例:**

```yaml
subagent_type: code-reviewer
model: sonnet
```

### Opus を使うべきタスク

| タスク                   | 理由                 |
| ------------------------ | -------------------- |
| 5+ファイルにまたがる変更 | 広いコンテキスト必要 |
| アーキテクチャ設計       | 複雑な判断           |
| セキュリティレビュー     | 見落とし防止         |
| 複雑なデバッグ           | 深い分析             |
| 新機能の設計             | 創造的思考           |

**Subagent定義例:**

```yaml
subagent_type: architect
model: opus
```

## コスト最適化のTips

### 1. 段階的アップグレード

```
1回目: Haiku で試行
   ↓ 失敗した場合
2回目: Sonnet で再試行
   ↓ まだ失敗した場合
3回目: Opus で最終試行
```

### 2. 並列実行の活用

```bash
# 複数のHaikuを並列実行 > 1つのOpus
Task(subagent_type=Explore, model=haiku)  # ファイル検索1
Task(subagent_type=Explore, model=haiku)  # ファイル検索2
Task(subagent_type=Explore, model=haiku)  # ファイル検索3
```

### 3. BoxLog固有の推奨

| 機能エリア           | 推奨モデル | 理由             |
| -------------------- | ---------- | ---------------- |
| Tags (CRUD)          | Sonnet     | 中程度の複雑さ   |
| Calendar (Drag&Drop) | Opus       | 複雑なロジック   |
| Inbox (表示)         | Haiku      | 単純なUI         |
| Plans (統計)         | Sonnet     | 計算ロジック     |
| 認証フロー           | Opus       | セキュリティ重要 |

## 実装パターン

### Taskツールでの指定

```typescript
// 高速検索
Task({
  subagent_type: 'Explore',
  model: 'haiku',
  prompt: 'Find all files using useTagsQuery hook',
});

// コード実装
Task({
  subagent_type: 'general-purpose',
  model: 'sonnet',
  prompt: 'Implement the new tag merge feature',
});

// 設計レビュー
Task({
  subagent_type: 'Plan',
  model: 'opus',
  prompt: 'Design the calendar sync architecture',
});
```

## 月間コスト目安

| 使用パターン       | 推定コスト |
| ------------------ | ---------- |
| Haiku主体（80%）   | ~$50/月    |
| Sonnet主体（標準） | ~$150/月   |
| Opus主体（高品質） | ~$500/月   |

**推奨**: Sonnet をデフォルトに、必要時のみ Opus にアップグレード
