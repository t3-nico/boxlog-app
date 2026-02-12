#!/usr/bin/env node

/**
 * 改善提案システム
 * 品質レポートに基づく自動Issue作成とSlack通知
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ImprovementSuggester {
  constructor() {
    this.rootPath = process.cwd();
    this.reportsDir = path.join(this.rootPath, 'reports', 'quality');
    this.issuesCreated = [];
    this.notifications = [];
  }

  /**
   * 最新の品質レポートを読み込み
   */
  loadLatestQualityReport() {
    try {
      if (!fs.existsSync(this.reportsDir)) {
        throw new Error(
          '品質レポートが見つかりません。先に npm run quality:report を実行してください。',
        );
      }

      const files = fs
        .readdirSync(this.reportsDir)
        .filter((f) => f.startsWith('quality-report-') && f.endsWith('.json'))
        .sort()
        .reverse();

      if (files.length === 0) {
        throw new Error('品質レポートファイルが見つかりません。');
      }

      const latestFile = files[0];
      const reportPath = path.join(this.reportsDir, latestFile);
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

      console.log(`📊 品質レポート読み込み: ${latestFile}`);
      console.log(`  スコア: ${report.score}/100 (${report.grade})`);
      console.log(`  推奨アクション: ${report.recommendations.length}件`);

      return report;
    } catch (error) {
      console.error('品質レポート読み込みエラー:', error.message);
      throw error;
    }
  }

  /**
   * 改善提案に基づくIssue作成
   */
  async createImprovementIssues(report) {
    console.log('\n🎯 改善提案Issue作成中...');

    const highPriorityRecommendations = report.recommendations.filter(
      (r) => r.type === 'critical' || r.type === 'high',
    );

    if (highPriorityRecommendations.length === 0) {
      console.log('✅ 高優先度の改善提案はありません');
      return;
    }

    for (const recommendation of highPriorityRecommendations) {
      try {
        const issueTitle = `品質改善: ${recommendation.message}`;
        const issueBody = this.generateIssueBody(recommendation, report);

        // GitHub CLI でIssue作成
        const command = [
          'gh',
          'issue',
          'create',
          '--title',
          `"${issueTitle}"`,
          '--body',
          `"${issueBody}"`,
          '--label',
          `"quality-improvement,${recommendation.type}"`,
        ].join(' ');

        const result = execSync(command, { encoding: 'utf8' });
        const issueUrl = result.trim();

        this.issuesCreated.push({
          title: issueTitle,
          url: issueUrl,
          type: recommendation.type,
          category: recommendation.category,
        });

        console.log(`✅ Issue作成: ${issueUrl}`);
      } catch (error) {
        console.error(`❌ Issue作成エラー (${recommendation.message}):`, error.message);
      }
    }
  }

  /**
   * Issue本文生成
   */
  generateIssueBody(recommendation, report) {
    return `## 📊 品質改善Issue

### 🎯 改善対象
**問題**: ${recommendation.message}
**カテゴリ**: ${recommendation.category}
**優先度**: ${recommendation.type}

### 💡 対策
${recommendation.action}

### 📈 工数・影響度
- **工数**: ${recommendation.effort}
- **影響度**: ${recommendation.impact}

### 📊 現在の品質状況
- **総合スコア**: ${report.score}/100点 (${report.grade})
- **ESLintエラー**: ${report.codeQuality.eslint.errors}件
- **TypeScriptエラー**: ${report.codeQuality.typescript.errors}件
- **テストカバレッジ**: ${report.testing.coverage.lines}%
- **技術的負債**: ${report.technicalDebt.todoCount}個のTODO

### ✅ 完了条件
- [ ] 対策の実行
- [ ] 改善の確認（メトリクス向上）
- [ ] 品質レポートでの検証

### 📅 期限
**${recommendation.type === 'critical' ? '今週中' : recommendation.type === 'high' ? '来週まで' : '今月中'}**

---
*自動生成されたIssue - 品質レポート ${new Date().toLocaleDateString('ja-JP')}*
*レポートファイル: reports/quality/quality-report-${new Date().toISOString().split('T')[0]}.json*`;
  }

  /**
   * Slack通知生成
   */
  generateSlackNotification(report) {
    const criticalIssues = this.issuesCreated.filter((i) => i.type === 'critical');
    const highIssues = this.issuesCreated.filter((i) => i.type === 'high');

    const notification = {
      text: `📊 Dayopt品質レポート - ${new Date().toLocaleDateString('ja-JP')}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 Dayopt 品質レポート',
          },
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*スコア:* ${report.score}/100 (${report.grade})`,
            },
            {
              type: 'mrkdwn',
              text: `*状態:* ${report.status}`,
            },
            {
              type: 'mrkdwn',
              text: `*ESLintエラー:* ${report.codeQuality.eslint.errors}件`,
            },
            {
              type: 'mrkdwn',
              text: `*TypeScriptエラー:* ${report.codeQuality.typescript.errors}件`,
            },
          ],
        },
      ],
    };

    // 緊急度別の通知セクション
    if (criticalIssues.length > 0) {
      notification.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `🚨 *緊急対応必要* (${criticalIssues.length}件)\n${criticalIssues.map((i) => `• <${i.url}|${i.title}>`).join('\n')}`,
        },
      });
    }

    if (highIssues.length > 0) {
      notification.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `⚠️ *高優先度* (${highIssues.length}件)\n${highIssues.map((i) => `• <${i.url}|${i.title}>`).join('\n')}`,
        },
      });
    }

    // 改善提案サマリー
    if (report.recommendations.length > 0) {
      const categories = [...new Set(report.recommendations.map((r) => r.category))];
      notification.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `📈 *改善分野:* ${categories.join(', ')}`,
        },
      });
    } else {
      notification.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '🎉 *現在、特に改善が必要な項目はありません*',
        },
      });
    }

    return notification;
  }

  /**
   * Slack通知送信（シミュレーション）
   */
  async sendSlackNotification(report) {
    console.log('\n📲 Slack通知準備中...');

    const notification = this.generateSlackNotification(report);

    // 通知データをファイルに保存（実際の送信の代わり）
    const notificationPath = path.join(
      this.reportsDir,
      `slack-notification-${new Date().toISOString().split('T')[0]}.json`,
    );
    fs.writeFileSync(notificationPath, JSON.stringify(notification, null, 2));

    console.log(`📲 Slack通知データ生成完了: ${notificationPath}`);
    console.log('実際のSlack送信には webhook URLの設定が必要です');

    // 実際のSlack送信コード（webhook URL設定時）
    /*
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification)
        })

        if (response.ok) {
          console.log('✅ Slack通知送信完了')
        } else {
          console.error('❌ Slack通知送信失敗:', response.statusText)
        }
      } catch (error) {
        console.error('❌ Slack通知エラー:', error.message)
      }
    }
    */

    return notification;
  }

  /**
   * 改善進捗追跡
   */
  async trackImprovementProgress() {
    console.log('\n📈 改善進捗追跡中...');

    try {
      // 品質改善ラベルが付いたIssue一覧取得
      const result = execSync(
        'gh issue list --label "quality-improvement" --json number,title,state,createdAt',
        {
          encoding: 'utf8',
        },
      );

      const issues = JSON.parse(result);

      const progressSummary = {
        total: issues.length,
        open: issues.filter((i) => i.state === 'OPEN').length,
        closed: issues.filter((i) => i.state === 'CLOSED').length,
        recentlyClosed: issues.filter(
          (i) =>
            i.state === 'CLOSED' &&
            new Date(i.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        ).length,
      };

      console.log(`📊 改善Issue状況:`);
      console.log(`  総数: ${progressSummary.total}件`);
      console.log(`  オープン: ${progressSummary.open}件`);
      console.log(`  完了: ${progressSummary.closed}件`);
      console.log(`  今週完了: ${progressSummary.recentlyClosed}件`);

      return progressSummary;
    } catch (error) {
      console.error('進捗追跡エラー:', error.message);
      return null;
    }
  }

  /**
   * サマリーレポート生成
   */
  generateSummaryReport(report, progress) {
    const summary = {
      timestamp: new Date().toISOString(),
      qualityScore: report.score,
      grade: report.grade,
      status: report.status,
      issuesCreated: this.issuesCreated.length,
      issues: this.issuesCreated,
      progress: progress,
      nextActions: this.generateNextActions(report),
    };

    // サマリーレポート保存
    const summaryPath = path.join(
      this.reportsDir,
      `improvement-summary-${new Date().toISOString().split('T')[0]}.json`,
    );
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    console.log(`\n📋 改善サマリーレポート: ${summaryPath}`);

    return summary;
  }

  /**
   * 次のアクション生成
   */
  generateNextActions(report) {
    const actions = [];

    if (report.score < 60) {
      actions.push('🚨 緊急: 品質スコアが危険レベルです。即座の対応が必要です。');
    }

    if (report.codeQuality.typescript.errors > 100) {
      actions.push('⚠️ TypeScriptエラーの修正を最優先で進めてください。');
    }

    if (report.codeQuality.eslint.errors > 0) {
      actions.push('🔧 npm run lint:fix でESLintエラーを修正してください。');
    }

    if (report.testing.coverage.lines < 80) {
      actions.push('🧪 テストカバレッジを80%まで向上させてください。');
    }

    if (actions.length === 0) {
      actions.push('✅ 継続的な品質維持に努めてください。');
    }

    return actions;
  }

  /**
   * 実行
   */
  async run() {
    try {
      console.log('🎯 Dayopt改善提案システム開始...');

      const report = this.loadLatestQualityReport();
      await this.createImprovementIssues(report);
      await this.sendSlackNotification(report);
      const progress = await this.trackImprovementProgress();
      const summary = this.generateSummaryReport(report, progress);

      console.log(`\n🎯 改善提案システム完了:`);
      console.log(`  Issue作成: ${this.issuesCreated.length}件`);
      console.log(`  Slack通知: 準備完了`);
      console.log(`  進捗追跡: 完了`);

      return summary;
    } catch (error) {
      console.error('❌ 改善提案システムエラー:', error.message);
      process.exit(1);
    }
  }
}

// コマンドライン引数処理
const args = process.argv.slice(2);
const options = {
  skipIssueCreation: args.includes('--skip-issues'),
  skipSlackNotification: args.includes('--skip-slack'),
  trackOnly: args.includes('--track-only'),
};

// 実行
if (require.main === module) {
  const suggester = new ImprovementSuggester();

  if (options.trackOnly) {
    suggester.trackImprovementProgress().catch(console.error);
  } else {
    suggester.run().catch(console.error);
  }
}

module.exports = ImprovementSuggester;
