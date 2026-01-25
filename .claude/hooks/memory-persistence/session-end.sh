#!/bin/bash
# Session End Hook - BoxLog
# セッション終了時にセッション状態を保存する

SESSIONS_DIR="$(dirname "$0")/../../sessions"
TODAY=$(date +%Y-%m-%d)
SESSION_FILE="$SESSIONS_DIR/${TODAY}-session.tmp"

mkdir -p "$SESSIONS_DIR"

# セッションファイルが存在しない場合はテンプレートを作成
if [ ! -f "$SESSION_FILE" ]; then
  cat > "$SESSION_FILE" << EOF
# Session: $TODAY

## Current State
- 作業中のファイル: (未記録)
- 完了したタスク: (未記録)

## Key Decisions
- (セッション中に記録)

## Approaches Tried
### Worked
-

### Did Not Work
-

## Context for Next Session
-

---
## Session Log
EOF
fi

# セッション終了を記録
echo "" >> "$SESSION_FILE"
echo "### Session ended: $(date '+%Y-%m-%d %H:%M:%S')" >> "$SESSION_FILE"

echo "[SessionEnd] Saved to .claude/sessions/${TODAY}-session.tmp" >&2

exit 0
