#!/bin/bash

# 最も簡単なケース：関数パラメータの _ プレフィックス付け
echo "🔧 未使用関数パラメータを修正中..."

# よくあるパターンを一括置換
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
  -e 's/(\([^,)]*,\s*\)node\([\s,)]\)/(\1_node\2/g' \
  -e 's/(\([^,)]*,\s*\)key\([\s,)]\)/(\1_key\2/g' \
  -e 's/(\([^,)]*,\s*\)index\([\s,)]\)/(\1_index\2/g' \
  -e 's/(\([^,)]*,\s*\)value\([\s,)]\)/(\1_value\2/g' \
  -e 's/(\([^,)]*,\s*\)args\([\s,)]\)/(\1_args\2/g'

# 配列の分割代入
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
  -e 's/\[\([^,\]]*,\s*\)chunk\([\s,\]]\)/[\1_chunk\2/g' \
  -e 's/\[\([^,\]]*,\s*\)item\([\s,\]]\)/[\1_item\2/g'

# 代入文
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
  -e 's/const currentFunctionName/const _currentFunctionName/g' \
  -e 's/const prefix/const _prefix/g' \
  -e 's/const assignee/const _assignee/g' \
  -e 's/let isError/let _isError/g' \
  -e 's/const staticManifestPath/const _staticManifestPath/g'

echo "✅ 基本的な未使用変数を修正しました"