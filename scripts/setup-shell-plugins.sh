#!/bin/bash

# BoxLog 1Password シェルプラグイン セットアップスクリプト
# このスクリプトは開発者が手動で実行する必要があります

echo "🔐 BoxLog 1Password シェルプラグイン セットアップ"
echo "=============================================="

# 1Password CLIがインストールされているかチェック
if ! command -v op &> /dev/null; then
    echo "❌ 1Password CLIがインストールされていません"
    echo "📖 セットアップガイド: docs/1PASSWORD_SETUP.md を参照してください"
    exit 1
fi

# サインイン状態をチェック
if ! op whoami &> /dev/null; then
    echo "❌ 1Passwordにサインインしていません"
    echo "💡 'op signin' を実行してください"
    exit 1
fi

echo "✅ 1Password CLI準備完了"

# 利用可能なプラグインを表示
echo ""
echo "📦 利用可能なシェルプラグイン:"
echo "  - gh (GitHub CLI)"
echo "  - aws (AWS CLI)"
echo "  - terraform"
echo "  - kubectl"
echo "  - docker"

echo ""
echo "🚀 GitHub CLI プラグインを設定しますか？ (y/n)"
read -p "選択: " setup_gh

if [[ $setup_gh == "y" || $setup_gh == "Y" ]]; then
    echo "🔧 GitHub CLI プラグインを初期化中..."
    if command -v gh &> /dev/null; then
        op plugin init gh
        echo "✅ GitHub CLI プラグイン設定完了"
    else
        echo "⚠️  GitHub CLIがインストールされていません"
        echo "💡 'brew install gh' でインストールしてください"
    fi
fi

echo ""
echo "🚀 AWS CLI プラグインを設定しますか？ (y/n)"
read -p "選択: " setup_aws

if [[ $setup_aws == "y" || $setup_aws == "Y" ]]; then
    echo "🔧 AWS CLI プラグインを初期化中..."
    if command -v aws &> /dev/null; then
        op plugin init aws
        echo "✅ AWS CLI プラグイン設定完了"
    else
        echo "⚠️  AWS CLIがインストールされていません"
        echo "💡 'brew install awscli' でインストールしてください"
    fi
fi

echo ""
echo "🎉 シェルプラグインのセットアップが完了しました！"
echo ""
echo "📝 使用方法:"
echo "  - GitHub: git操作やgh操作で自動的に1Passwordから認証情報を取得"
echo "  - AWS: AWSリソースアクセス時に1Passwordから認証情報を取得"
echo ""
echo "🔍 詳細情報: https://developer.1password.com/docs/cli/shell-plugins/"