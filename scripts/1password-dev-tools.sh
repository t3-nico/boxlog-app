#!/bin/bash

# BoxLog 1Password開発ツール管理スクリプト
# 開発チーム向けの1Password関連タスクを自動化

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ロゴ表示
echo -e "${BLUE}"
echo "┌─────────────────────────────────────┐"
echo "│     🔐 BoxLog 1Password Tools      │"
echo "│        開発チーム管理ツール         │"
echo "└─────────────────────────────────────┘"
echo -e "${NC}"

# ヘルプ関数
show_help() {
    echo "使用方法: $0 [コマンド] [オプション]"
    echo ""
    echo "利用可能なコマンド:"
    echo "  status      - 1Password接続状態とVault情報を表示"
    echo "  sync        - 環境変数を1Passwordから最新の値に同期"
    echo "  backup      - 現在の環境変数をバックアップ"
    echo "  restore     - バックアップから環境変数を復元"
    echo "  audit       - セキュリティ監査（アクセスログ等）を実行"
    echo "  rotate      - 定期的なシークレットローテーションをチェック"
    echo "  team-setup  - 新しいチームメンバー向けセットアップ"
    echo "  health      - 1Password連携の健全性チェック"
    echo ""
    echo "オプション:"
    echo "  -h, --help     このヘルプを表示"
    echo "  -v, --verbose  詳細出力モード"
    echo ""
    echo "例:"
    echo "  $0 status"
    echo "  $0 sync --verbose"
    echo "  $0 team-setup"
}

# 1Password接続確認
check_op_connection() {
    if ! command -v op &> /dev/null; then
        echo -e "${RED}❌ 1Password CLIがインストールされていません${NC}"
        echo "📖 セットアップガイド: docs/1PASSWORD_SETUP.md"
        exit 1
    fi

    if ! op whoami &> /dev/null; then
        echo -e "${RED}❌ 1Passwordにサインインしていません${NC}"
        echo "💡 'op signin' を実行してください"
        exit 1
    fi
}

# ステータス確認
show_status() {
    echo -e "${BLUE}📊 1Password接続状態${NC}"
    echo "----------------------------------------"
    
    # アカウント情報
    echo -e "${GREEN}✅ アカウント情報:${NC}"
    op whoami 2>/dev/null || echo "情報取得エラー"
    echo ""
    
    # Vault情報
    echo -e "${GREEN}📦 BoxLog Development Vault:${NC}"
    local vault_items=$(op item list --vault="BoxLog Development" 2>/dev/null | wc -l)
    echo "  登録アイテム数: $((vault_items - 1))" # ヘッダー行を除く
    echo ""
    
    # 環境変数確認
    echo -e "${GREEN}🔐 環境変数ステータス:${NC}"
    if op run --env-file=.env.local -- printenv NEXT_PUBLIC_SUPABASE_URL &>/dev/null; then
        echo "  ✅ NEXT_PUBLIC_SUPABASE_URL: 正常"
    else
        echo "  ❌ NEXT_PUBLIC_SUPABASE_URL: エラー"
    fi
    
    if op run --env-file=.env.local -- printenv POSTGRES_URL &>/dev/null; then
        echo "  ✅ POSTGRES_URL: 正常"
    else
        echo "  ❌ POSTGRES_URL: エラー"
    fi
}

# 環境変数同期
sync_env() {
    echo -e "${BLUE}🔄 環境変数同期中...${NC}"
    
    # バックアップ作成
    if [ -f .env.local ]; then
        cp .env.local .env.local.backup.$(date +%Y%m%d_%H%M%S)
        echo -e "${GREEN}✅ 現在の設定をバックアップしました${NC}"
    fi
    
    # 1Passwordから値を確認
    echo "🔍 1Passwordから最新の値を確認中..."
    
    if op run --env-file=.env.local -- echo "環境変数の読み込みテスト完了" &>/dev/null; then
        echo -e "${GREEN}✅ 環境変数同期完了${NC}"
    else
        echo -e "${RED}❌ 環境変数同期に失敗しました${NC}"
        exit 1
    fi
}

# セキュリティ監査
run_audit() {
    echo -e "${BLUE}🔍 セキュリティ監査実行中...${NC}"
    echo "----------------------------------------"
    
    # 1. 最近のアクセスログ確認
    echo "📊 最近のVaultアクセス:"
    echo "  (1Password Web UIでActivity Logを確認してください)"
    echo "  URL: https://my.1password.com/activity"
    echo ""
    
    # 2. 環境変数ファイルの権限確認
    echo "🔒 ファイル権限チェック:"
    if [ -f .env.local ]; then
        local perms=$(stat -f "%Mp%Lp" .env.local 2>/dev/null || stat -c "%a" .env.local 2>/dev/null)
        echo "  .env.local: $perms"
        if [[ "$perms" == *"600"* ]] || [[ "$perms" == *"rw-------"* ]]; then
            echo -e "  ${GREEN}✅ ファイル権限は安全です${NC}"
        else
            echo -e "  ${YELLOW}⚠️  ファイル権限を600に設定することを推奨します${NC}"
            echo "  実行: chmod 600 .env.local"
        fi
    fi
    echo ""
    
    # 3. Git設定確認
    echo "📝 Git設定チェック:"
    if grep -q ".env.local" .gitignore 2>/dev/null; then
        echo -e "  ${GREEN}✅ .env.localは.gitignoreに含まれています${NC}"
    else
        echo -e "  ${RED}❌ .env.localを.gitignoreに追加してください${NC}"
    fi
}

# チームセットアップ
team_setup() {
    echo -e "${BLUE}👥 新しいチームメンバー向けセットアップ${NC}"
    echo "=============================================="
    
    # 1. 必要ツールの確認
    echo "🔧 必要ツールの確認:"
    
    tools=("op" "node" "npm" "git")
    for tool in "${tools[@]}"; do
        if command -v "$tool" &> /dev/null; then
            echo -e "  ${GREEN}✅ $tool${NC}"
        else
            echo -e "  ${RED}❌ $tool (要インストール)${NC}"
        fi
    done
    echo ""
    
    # 2. セットアップ手順案内
    echo "📋 セットアップ手順:"
    echo "  1. 1Password CLI: brew install --cask 1password/tap/1password-cli"
    echo "  2. サインイン: op signin"
    echo "  3. 依存関係: npm install"
    echo "  4. VS Code拡張: 1Password for VS Code"
    echo "  5. 開発サーバー: npm run dev"
    echo ""
    
    # 3. アクセス権限確認
    echo "🔑 アクセス権限確認:"
    if op item list --vault="BoxLog Development" &>/dev/null; then
        echo -e "  ${GREEN}✅ BoxLog Development Vaultにアクセス可能${NC}"
    else
        echo -e "  ${RED}❌ BoxLog Development Vaultへのアクセス権限が必要です${NC}"
        echo "  💡 チーム管理者に権限付与を依頼してください"
    fi
}

# 健全性チェック
health_check() {
    echo -e "${BLUE}🏥 1Password連携健全性チェック${NC}"
    echo "=============================================="
    
    local errors=0
    
    # 1. CLI接続確認
    echo "🔗 CLI接続確認:"
    if op whoami &>/dev/null; then
        echo -e "  ${GREEN}✅ 1Password CLI接続正常${NC}"
    else
        echo -e "  ${RED}❌ 1Password CLI接続エラー${NC}"
        ((errors++))
    fi
    
    # 2. Vault アクセス確認
    echo "📦 Vaultアクセス確認:"
    if op vault get "BoxLog Development" &>/dev/null; then
        echo -e "  ${GREEN}✅ BoxLog Development Vault アクセス正常${NC}"
    else
        echo -e "  ${RED}❌ BoxLog Development Vault アクセスエラー${NC}"
        ((errors++))
    fi
    
    # 3. 重要なアイテム確認
    echo "🔐 重要アイテム確認:"
    local items=("BoxLog Supabase" "BoxLog PostgreSQL")
    for item in "${items[@]}"; do
        if op item get "$item" --vault="BoxLog Development" &>/dev/null; then
            echo -e "  ${GREEN}✅ $item${NC}"
        else
            echo -e "  ${RED}❌ $item (見つかりません)${NC}"
            ((errors++))
        fi
    done
    
    # 4. 環境変数テスト
    echo "🌍 環境変数テスト:"
    if op run --env-file=.env.local -- printenv NEXT_PUBLIC_SUPABASE_URL &>/dev/null; then
        echo -e "  ${GREEN}✅ 環境変数読み込み正常${NC}"
    else
        echo -e "  ${RED}❌ 環境変数読み込みエラー${NC}"
        ((errors++))
    fi
    
    echo ""
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}🎉 すべてのチェックに合格しました！${NC}"
    else
        echo -e "${RED}⚠️  $errors 個のエラーが検出されました${NC}"
        echo "📖 詳細は docs/1PASSWORD_SETUP.md を参照してください"
    fi
}

# メイン処理
main() {
    case "${1:-}" in
        "status")
            check_op_connection
            show_status
            ;;
        "sync")
            check_op_connection
            sync_env
            ;;
        "audit")
            check_op_connection
            run_audit
            ;;
        "team-setup")
            team_setup
            ;;
        "health")
            health_check
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