#!/bin/bash

# 🚀 BoxLog Deploy Hooks
# デプロイプロセスに統合するためのフックスクリプト集

set -e  # エラーで停止

# 色付き出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
DIM='\033[0;90m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${CYAN}🔄 $1${NC}"
}

# デプロイ環境の検出
detect_environment() {
    # Vercel環境
    if [[ -n "$VERCEL" ]]; then
        if [[ "$VERCEL_ENV" == "production" ]]; then
            echo "production"
        elif [[ "$VERCEL_ENV" == "preview" ]]; then
            echo "preview"
        else
            echo "staging"
        fi
    # GitHub Actions環境
    elif [[ -n "$GITHUB_ACTIONS" ]]; then
        if [[ "$GITHUB_REF" == "refs/heads/main" ]]; then
            echo "production"
        elif [[ "$GITHUB_REF" == "refs/heads/dev" ]]; then
            echo "staging"
        else
            echo "preview"
        fi
    # ローカル環境
    else
        echo "${DEPLOY_ENV:-development}"
    fi
}

# デプロイ前フック
pre_deploy_hook() {
    local environment=$(detect_environment)

    log_step "Pre-deploy hook started for $environment"

    # Git状態の確認
    if [[ -d .git ]]; then
        local git_status=$(git status --porcelain)
        if [[ -n "$git_status" && "$environment" == "production" ]]; then
            log_warning "Working directory is not clean for production deploy"
            git status --short
        fi

        # コミットハッシュの確認
        local commit_hash=$(git rev-parse HEAD)
        local branch=$(git rev-parse --abbrev-ref HEAD)
        log_info "Current commit: $commit_hash ($branch)"
    fi

    # 環境変数の確認
    log_step "Checking environment variables..."
    if command -v node >/dev/null 2>&1; then
        npm run env:check || log_warning "Environment check failed"
    fi

    # 依存関係の確認
    if [[ -f package.json ]]; then
        log_step "Checking dependencies..."
        if [[ ! -d node_modules || package.json -nt node_modules ]]; then
            log_info "Installing dependencies..."
            npm install
        fi
    fi

    # ビルドテスト（ローカルの場合）
    if [[ "$environment" == "development" ]]; then
        log_step "Running build test..."
        npm run build || {
            log_error "Build test failed"
            exit 1
        }
    fi

    log_success "Pre-deploy hook completed"
}

# デプロイ後フック
post_deploy_hook() {
    local environment=$(detect_environment)
    local build_start_time=${BUILD_START_TIME:-$(date +%s)}
    local build_end_time=$(date +%s)
    local build_duration=$((build_end_time - build_start_time))

    log_step "Post-deploy hook started for $environment"

    # デプロイ履歴の記録
    log_step "Recording deploy history..."

    local deploy_notes=""

    # CI/CD環境での追加情報
    if [[ -n "$GITHUB_ACTIONS" ]]; then
        deploy_notes="GitHub Actions workflow: $GITHUB_WORKFLOW, Run ID: $GITHUB_RUN_ID"
    elif [[ -n "$VERCEL" ]]; then
        deploy_notes="Vercel deployment, URL: ${VERCEL_URL:-unknown}"
    fi

    # デプロイ記録の実行
    if command -v node >/dev/null 2>&1 && [[ -f scripts/deploy-tracker.js ]]; then
        node scripts/deploy-tracker.js record "$environment" \
            --build-time="$build_duration" \
            --notes="$deploy_notes" || {
            log_warning "Failed to record deploy history"
        }
    else
        log_warning "Deploy tracker not available"
    fi

    # ヘルスチェック（本番環境の場合）
    if [[ "$environment" == "production" ]]; then
        log_step "Running health check..."
        sleep 5  # デプロイ完了を待つ

        local health_url="${VERCEL_URL:-${NEXT_PUBLIC_APP_URL:-http://localhost:3000}}"
        if command -v curl >/dev/null 2>&1; then
            if curl -f -s "$health_url/api/health" > /dev/null; then
                log_success "Health check passed"
            else
                log_warning "Health check failed or endpoint not available"
            fi
        fi
    fi

    # Slack通知（設定されている場合）
    if [[ -n "$SLACK_WEBHOOK_URL" && "$environment" == "production" ]]; then
        log_step "Sending Slack notification..."

        local commit_msg=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "Unknown")
        local commit_hash=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
        local app_version=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")

        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"text\": \"🚀 BoxLog deployed to $environment\",
                \"blocks\": [
                    {
                        \"type\": \"section\",
                        \"text\": {
                            \"type\": \"mrkdwn\",
                            \"text\": \"*BoxLog Deployment Successful* 🎉\\n*Environment:* $environment\\n*Version:* $app_version\\n*Commit:* $commit_hash\\n*Message:* $commit_msg\\n*Build Time:* ${build_duration}s\"
                        }
                    }
                ]
            }" \
            "$SLACK_WEBHOOK_URL" || log_warning "Slack notification failed"
    fi

    # 統計情報の表示
    if command -v node >/dev/null 2>&1 && [[ -f scripts/deploy-tracker.js ]]; then
        echo ""
        log_step "Deploy statistics:"
        node scripts/deploy-tracker.js stats
    fi

    log_success "Post-deploy hook completed"
    log_success "🎉 Deploy to $environment completed successfully!"
}

# ロールバックフック
rollback_hook() {
    local from_version="$1"
    local to_version="$2"
    local environment=$(detect_environment)

    if [[ -z "$from_version" || -z "$to_version" ]]; then
        log_error "Usage: rollback_hook <from_version> <to_version>"
        exit 1
    fi

    log_step "Rollback hook started: $from_version → $to_version ($environment)"

    # ロールバック記録
    if command -v node >/dev/null 2>&1 && [[ -f scripts/deploy-tracker.js ]]; then
        node scripts/deploy-tracker.js rollback "$from_version" "$to_version" "$environment" || {
            log_warning "Failed to record rollback"
        }
    fi

    # Slack通知（設定されている場合）
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"text\": \"🔄 BoxLog rollback on $environment\",
                \"blocks\": [
                    {
                        \"type\": \"section\",
                        \"text\": {
                            \"type\": \"mrkdwn\",
                            \"text\": \"*BoxLog Rollback* ⚠️\\n*Environment:* $environment\\n*From Version:* $from_version\\n*To Version:* $to_version\\n*Time:* $(date -u +'%Y-%m-%d %H:%M:%S UTC')\"
                        }
                    }
                ]
            }" \
            "$SLACK_WEBHOOK_URL" || log_warning "Slack notification failed"
    fi

    log_success "Rollback hook completed"
}

# デプロイ失敗フック
deploy_failure_hook() {
    local environment=$(detect_environment)
    local error_message="${1:-Unknown error}"

    log_error "Deploy failure hook triggered for $environment"
    log_error "Error: $error_message"

    # 失敗記録
    if command -v node >/dev/null 2>&1 && [[ -f scripts/deploy-tracker.js ]]; then
        node scripts/deploy-tracker.js record "$environment" \
            --status="failed" \
            --notes="Deploy failed: $error_message" || {
            log_warning "Failed to record deploy failure"
        }
    fi

    # Slack通知（設定されている場合）
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"text\": \"💥 BoxLog deploy failed on $environment\",
                \"blocks\": [
                    {
                        \"type\": \"section\",
                        \"text\": {
                            \"type\": \"mrkdwn\",
                            \"text\": \"*BoxLog Deploy Failed* 💥\\n*Environment:* $environment\\n*Error:* $error_message\\n*Time:* $(date -u +'%Y-%m-%d %H:%M:%S UTC')\"
                        }
                    }
                ]
            }" \
            "$SLACK_WEBHOOK_URL" || log_warning "Slack notification failed"
    fi

    log_error "Deploy failure hook completed"
}

# メイン処理
main() {
    case "${1:-}" in
        "pre-deploy")
            BUILD_START_TIME=$(date +%s)
            export BUILD_START_TIME
            pre_deploy_hook
            ;;
        "post-deploy")
            post_deploy_hook
            ;;
        "rollback")
            rollback_hook "$2" "$3"
            ;;
        "failure")
            deploy_failure_hook "$2"
            ;;
        *)
            echo "Usage: $0 {pre-deploy|post-deploy|rollback|failure} [args...]"
            echo ""
            echo "Commands:"
            echo "  pre-deploy           - Run pre-deployment checks"
            echo "  post-deploy          - Record deployment and run post-deploy tasks"
            echo "  rollback <from> <to> - Record rollback operation"
            echo "  failure <message>    - Record deployment failure"
            echo ""
            echo "Environment Variables:"
            echo "  DEPLOY_ENV          - Target environment (production/staging/preview)"
            echo "  SLACK_WEBHOOK_URL   - Slack webhook for notifications"
            echo "  VERCEL_URL          - Vercel deployment URL (auto-detected)"
            echo "  GITHUB_*            - GitHub Actions variables (auto-detected)"
            exit 1
            ;;
    esac
}

# 実行
main "$@"