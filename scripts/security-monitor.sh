#!/bin/bash

# BoxLog 1Password セキュリティ監視スクリプト
# 定期的なセキュリティチェックとログ記録

set -e

# ログディレクトリ作成
LOG_DIR="./logs/security"
mkdir -p "$LOG_DIR"

# ログファイル設定
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/security_audit_$TIMESTAMP.log"

# ログ関数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🔍 BoxLog セキュリティ監視開始"
log "=============================================="

# 1. 1Password接続状態確認
log "📊 1Password接続状態確認"
if op whoami &>/dev/null; then
    ACCOUNT_INFO=$(op whoami)
    log "✅ 1Password接続正常: $ACCOUNT_INFO"
else
    log "❌ 1Password接続エラー"
    exit 1
fi

# 2. Vault完整性確認
log "📦 Vault完整性確認"
EXPECTED_ITEMS=("BoxLog Supabase" "BoxLog PostgreSQL")
VAULT_NAME="BoxLog Development"

for item in "${EXPECTED_ITEMS[@]}"; do
    if op item get "$item" --vault="$VAULT_NAME" &>/dev/null; then
        log "✅ $item: 存在確認"
        
        # アイテムの最終更新日を記録
        LAST_MODIFIED=$(op item get "$item" --vault="$VAULT_NAME" --format=json | jq -r '.updatedAt // "N/A"')
        log "📅 $item 最終更新: $LAST_MODIFIED"
    else
        log "❌ $item: 見つかりません"
    fi
done

# 3. 環境変数アクセステスト
log "🌍 環境変数アクセステスト"
ENV_VARS=("NEXT_PUBLIC_SUPABASE_URL" "POSTGRES_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")

for var in "${ENV_VARS[@]}"; do
    if op run --env-file=.env.local -- printenv "$var" &>/dev/null; then
        log "✅ $var: アクセス正常"
    else
        log "❌ $var: アクセスエラー"
    fi
done

# 4. ファイル権限チェック
log "🔒 ファイル権限チェック"
SENSITIVE_FILES=(".env.local" ".env.example")

for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ]; then
        PERMS=$(stat -f "%Mp%Lp" "$file" 2>/dev/null || stat -c "%a" "$file" 2>/dev/null)
        log "📄 $file: 権限 $PERMS"
        
        # 権限が適切かチェック
        if [[ "$file" == ".env.local" ]]; then
            if [[ "$PERMS" == *"600"* ]] || [[ "$PERMS" == *"rw-------"* ]]; then
                log "✅ $file: 安全な権限設定"
            else
                log "⚠️  $file: 権限を600に変更することを推奨"
            fi
        fi
    else
        log "📄 $file: ファイルが存在しません"
    fi
done

# 5. Git設定確認
log "📝 Git設定確認"
if [ -f ".gitignore" ]; then
    if grep -q ".env.local" .gitignore; then
        log "✅ .env.localは.gitignoreに含まれています"
    else
        log "❌ .env.localを.gitignoreに追加してください"
    fi
    
    if grep -q "logs/" .gitignore; then
        log "✅ logs/は.gitignoreに含まれています"
    else
        log "⚠️  logs/を.gitignoreに追加することを推奨"
    fi
else
    log "❌ .gitignoreファイルが見つかりません"
fi

# 6. プロセス監視
log "🖥️  プロセス監視"
if pgrep -f "1Password" &>/dev/null; then
    log "✅ 1Passwordプロセス実行中"
else
    log "⚠️  1Passwordプロセスが見つかりません"
fi

# 7. ネットワーク接続確認
log "🌐 ネットワーク接続確認"
if ping -c 1 my.1password.com &>/dev/null; then
    log "✅ 1Password サーバー接続正常"
else
    log "❌ 1Password サーバー接続エラー"
fi

# 8. 推奨アクション生成
log "💡 推奨アクション"
echo "" >> "$LOG_FILE"
echo "# セキュリティ推奨アクション" >> "$LOG_FILE"
echo "1. 定期的な1Password Activity Logの確認" >> "$LOG_FILE"
echo "2. Service Account Tokenの定期ローテーション" >> "$LOG_FILE"
echo "3. 不要なアクセス権限の削除" >> "$LOG_FILE"
echo "4. チームメンバーの定期的なアクセス権限見直し" >> "$LOG_FILE"

log "🎯 セキュリティ監視完了"

# ログファイルのパスを表示
echo ""
echo "📋 詳細ログ: $LOG_FILE"

# 7日より古いログファイルを削除
find "$LOG_DIR" -name "security_audit_*.log" -mtime +7 -delete 2>/dev/null || true
log "🧹 古いログファイルをクリーンアップしました"