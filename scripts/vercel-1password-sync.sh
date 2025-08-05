#!/bin/bash

# BoxLog Vercel + 1Password 環境変数同期スクリプト
# 1PasswordからVercelへの環境変数同期を自動化

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 設定
VAULT_NAME="BoxLog Development"
VERCEL_PROJECT_NAME="boxlog-app"

# ロゴ表示
echo -e "${BLUE}"
echo "┌─────────────────────────────────────┐"
echo "│   🚀 Vercel × 1Password Sync      │"
echo "│     環境変数自動同期ツール          │"
echo "└─────────────────────────────────────┘"
echo -e "${NC}"

# ヘルプ関数
show_help() {
    echo "使用方法: $0 [コマンド] [環境]"
    echo ""
    echo "利用可能なコマンド:"
    echo "  sync      - 1PasswordからVercelに環境変数を同期"
    echo "  preview   - 同期される内容を事前確認（実際の同期なし）"
    echo "  status    - 現在の環境変数状態を確認"
    echo "  setup     - Vercel CLI認証とシェルプラグイン設定"
    echo ""
    echo "環境:"
    echo "  development  - 開発環境"
    echo "  preview      - プレビュー環境"
    echo "  production   - 本番環境"
    echo ""
    echo "例:"
    echo "  $0 sync development"
    echo "  $0 preview production"
    echo "  $0 setup"
}

# 必須ツールの確認
check_dependencies() {
    echo -e "${BLUE}🔧 依存関係チェック${NC}"
    
    # 1Password CLI
    if ! command -v op &> /dev/null; then
        echo -e "${RED}❌ 1Password CLIがインストールされていません${NC}"
        echo "💡 'brew install --cask 1password/tap/1password-cli' でインストール"
        exit 1
    fi
    
    # Vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLIがインストールされていません${NC}"
        echo "💡 'npm install -g vercel' でインストール"
        exit 1
    fi
    
    # 1Password認証確認
    if ! op whoami &>/dev/null; then
        echo -e "${RED}❌ 1Passwordにサインインしていません${NC}"
        echo "💡 'op signin' を実行してください"
        exit 1
    fi
    
    echo -e "${GREEN}✅ すべての依存関係が満たされています${NC}"
}

# Vercel認証確認
check_vercel_auth() {
    echo -e "${BLUE}🔐 Vercel認証確認${NC}"
    
    if ! vercel whoami &>/dev/null; then
        echo -e "${RED}❌ Vercelにログインしていません${NC}"
        echo "💡 'vercel login' を実行してください"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Vercel認証確認完了${NC}"
}

# 環境変数マッピング定義
get_env_mappings() {
    cat << 'EOF'
NEXT_PUBLIC_SUPABASE_URL|op://BoxLog Development/BoxLog Supabase/url
NEXT_PUBLIC_SUPABASE_ANON_KEY|op://BoxLog Development/BoxLog Supabase/anon_key
SUPABASE_SERVICE_ROLE_KEY|op://BoxLog Development/BoxLog Supabase/service_role_key
SUPABASE_JWT_SECRET|op://BoxLog Development/BoxLog Supabase/jwt_secret
POSTGRES_URL|op://BoxLog Development/BoxLog PostgreSQL/url
POSTGRES_USER|op://BoxLog Development/BoxLog PostgreSQL/user
POSTGRES_HOST|op://BoxLog Development/BoxLog PostgreSQL/host
POSTGRES_PASSWORD|op://BoxLog Development/BoxLog PostgreSQL/password
POSTGRES_DATABASE|op://BoxLog Development/BoxLog PostgreSQL/database
POSTGRES_PRISMA_URL|op://BoxLog Development/BoxLog PostgreSQL/prisma_url
POSTGRES_URL_NON_POOLING|op://BoxLog Development/BoxLog PostgreSQL/url_non_pooling
EOF
}

# 環境変数同期プレビュー
preview_sync() {
    local target_env=${1:-development}
    
    echo -e "${BLUE}👀 同期プレビュー（${target_env}環境）${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    get_env_mappings | while IFS='|' read -r env_name op_reference; do
        if [[ -n "$env_name" && -n "$op_reference" ]]; then
            # 1Passwordから値を取得（表示用にマスク）
            if op_value=$(op read "$op_reference" 2>/dev/null); then
                masked_value="${op_value:0:8}***${op_value: -4}"
                echo -e "📝 ${env_name}: ${GREEN}${masked_value}${NC}"
            else
                echo -e "📝 ${env_name}: ${RED}❌ 取得失敗${NC}"
            fi
        fi
    done
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${YELLOW}ℹ️  実際の同期を行う場合は 'sync' コマンドを使用してください${NC}"
}

# 実際の環境変数同期
sync_environment() {
    local target_env=${1:-development}
    
    echo -e "${BLUE}🔄 環境変数同期開始（${target_env}環境）${NC}"
    
    local success_count=0
    local error_count=0
    
    get_env_mappings | while IFS='|' read -r env_name op_reference; do
        if [[ -n "$env_name" && -n "$op_reference" ]]; then
            echo -n "📤 同期中: $env_name ... "
            
            # 1Passwordから値を取得
            if op_value=$(op read "$op_reference" 2>/dev/null); then
                # Vercelに環境変数を設定
                if echo "$op_value" | vercel env add "$env_name" "$target_env" --force 2>/dev/null; then
                    echo -e "${GREEN}✅${NC}"
                    ((success_count++))
                else
                    echo -e "${RED}❌ Vercel設定失敗${NC}"
                    ((error_count++))
                fi
            else
                echo -e "${RED}❌ 1Password取得失敗${NC}"
                ((error_count++))
            fi
        fi
    done
    
    echo ""
    echo -e "${GREEN}✅ 同期完了: ${success_count}個成功${NC}"
    if [ $error_count -gt 0 ]; then
        echo -e "${RED}❌ エラー: ${error_count}個失敗${NC}"
    fi
}

# 現在の状態確認
check_status() {
    echo -e "${BLUE}📊 現在の状態確認${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 1Password状態
    echo -e "${GREEN}🔐 1Password状態:${NC}"
    if op whoami 2>/dev/null; then
        echo "  ✅ サインイン済み"
        
        # Vault内容確認
        local item_count=$(op item list --vault="$VAULT_NAME" 2>/dev/null | wc -l)
        echo "  📦 $VAULT_NAME: $((item_count - 1))個のアイテム"
    else
        echo "  ❌ サインインが必要"
    fi
    
    echo ""
    
    # Vercel状態
    echo -e "${GREEN}🚀 Vercel状態:${NC}"
    if vercel whoami 2>/dev/null; then
        echo "  ✅ ログイン済み"
        
        # プロジェクト確認
        if vercel projects ls 2>/dev/null | grep -q "$VERCEL_PROJECT_NAME"; then
            echo "  📋 プロジェクト: $VERCEL_PROJECT_NAME 存在"
        else
            echo "  ⚠️  プロジェクト: $VERCEL_PROJECT_NAME 見つからない"
        fi
    else
        echo "  ❌ ログインが必要"
    fi
}

# セットアップ（Vercel CLI認証とシェルプラグイン）
setup_integration() {
    echo -e "${BLUE}⚙️  Vercel × 1Password セットアップ${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 1. Vercel CLIシェルプラグイン設定
    echo -e "${YELLOW}📋 Vercel CLIシェルプラグイン設定${NC}"
    echo "以下のコマンドを手動で実行してください："
    echo ""
    echo "  op plugin init vercel"
    echo ""
    echo "これにより、Vercel CLIが1Password経由で安全に認証されます。"
    echo ""
    
    # 2. Vercelログイン確認
    echo -e "${YELLOW}🔐 Vercelログイン確認${NC}"
    if ! vercel whoami &>/dev/null; then
        echo "Vercelにログインしてください："
        echo "  vercel login"
    else
        echo "✅ 既にログイン済みです"
    fi
    
    echo ""
    
    # 3. プロジェクトリンク確認
    echo -e "${YELLOW}🔗 プロジェクトリンク確認${NC}"
    echo "プロジェクトをVercelにリンクしてください："
    echo "  vercel link"
    echo ""
    
    echo -e "${GREEN}🎉 セットアップ完了後、以下のコマンドでテストしてください：${NC}"
    echo "  $0 status"
}

# メイン処理
main() {
    case "${1:-}" in
        "sync")
            check_dependencies
            check_vercel_auth
            sync_environment "${2:-development}"
            ;;
        "preview")
            check_dependencies
            preview_sync "${2:-development}"
            ;;
        "status")
            check_status
            ;;
        "setup")
            setup_integration
            ;;
        "-h"|"--help"|"help"|"")
            show_help
            ;;
        *)
            echo -e "${RED}❌ 不明なコマンド: $1${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# スクリプト実行
main "$@"