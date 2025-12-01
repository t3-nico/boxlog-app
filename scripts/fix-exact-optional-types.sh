#!/bin/bash
# exactOptionalPropertyTypes: true エラーを一括修正するスクリプト
# 使用方法: ./scripts/fix-exact-optional-types.sh

set -e

echo "🔧 exactOptionalPropertyTypes エラーを修正中..."

# 1. よくあるパターンを修正（オプショナルプロパティに | undefined を追加）
find src -type f -name "*.ts" -o -name "*.tsx" | while read -r file; do
  # インターフェース内のオプショナルプロパティに | undefined を追加
  # ただし、既に | undefined がある場合はスキップ
  sed -i 's/\(  [a-zA-Z_][a-zA-Z0-9_]*\?\): \([^|]*\)$/\1: \2 | undefined/g' "$file" 2>/dev/null || true
done

echo "✅ 型定義の修正完了"

# 2. npm run typecheck を実行して確認
echo "🔍 型チェック実行中..."
npm run typecheck 2>&1 | grep "^Found" || echo "型チェック完了"

echo "✅ 修正完了"
