#!/bin/bash
# Session Start Hook - BoxLog
# セッション開始時に過去のコンテキストをロードする
#
# 動作:
# 1. 直近7日間のセッションファイルをチェック
# 2. learned/ フォルダのスキルを通知
# 3. 前回のセッションサマリーを表示

SESSIONS_DIR="$(dirname "$0")/../../sessions"
LEARNED_DIR="$SESSIONS_DIR/learned"

# セッションディレクトリが存在しない場合は作成
mkdir -p "$SESSIONS_DIR"
mkdir -p "$LEARNED_DIR"

# 直近7日間のセッションファイルを検索
recent_sessions=$(find "$SESSIONS_DIR" -maxdepth 1 -name "*.tmp" -type f -mtime -7 2>/dev/null | sort -r | head -5)

if [ -n "$recent_sessions" ]; then
  session_count=$(echo "$recent_sessions" | wc -l | tr -d ' ')
  echo "[SessionStart] Found $session_count recent session(s) in last 7 days:" >&2

  # 最新のセッションファイルのみ詳細表示
  latest_session=$(echo "$recent_sessions" | head -1)
  if [ -f "$latest_session" ]; then
    session_name=$(basename "$latest_session" .tmp)
    echo "[SessionStart] Latest: $session_name" >&2

    # Context for Next Session セクションがあれば表示
    if grep -q "## Context for Next Session" "$latest_session" 2>/dev/null; then
      echo "[SessionStart] Previous context available - use @.claude/sessions/$(basename "$latest_session") to load" >&2
    fi
  fi
fi

# 学習済みパターンの数を表示
learned_count=$(find "$LEARNED_DIR" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
if [ "$learned_count" -gt 0 ]; then
  echo "[SessionStart] $learned_count learned pattern(s) available in .claude/sessions/learned/" >&2
fi

# 正常終了（hookがブロックしないように）
exit 0
