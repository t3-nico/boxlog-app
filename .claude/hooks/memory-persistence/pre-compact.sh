#!/bin/bash
# Pre-Compact Hook - BoxLog
# コンパクト前にセッション状態を保存する

SESSIONS_DIR="$(dirname "$0")/../../sessions"
TODAY=$(date +%Y-%m-%d)
SESSION_FILE="$SESSIONS_DIR/${TODAY}-session.tmp"

mkdir -p "$SESSIONS_DIR"

# コンパクトイベントを記録
if [ -f "$SESSION_FILE" ]; then
  echo "" >> "$SESSION_FILE"
  echo "### Context compacted: $(date '+%H:%M:%S')" >> "$SESSION_FILE"
fi

echo "[PreCompact] State saved before compaction" >&2

exit 0
