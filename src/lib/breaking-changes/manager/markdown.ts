/**
 * Markdownドキュメント生成
 */

import type { BreakingChange, BreakingChangeSummary, ImpactLevel } from '../types'

import { getChangeEmoji, getGroupDisplayName, getGroupEmoji, getImpactEmoji, groupChangesByVersion } from './helpers'

/**
 * 📄 Markdownドキュメント生成
 */
export function generateMarkdownDocument(
  changes: BreakingChange[],
  generateVersionSummary: (version: string) => BreakingChangeSummary
): string {
  const sortedChanges = changes.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())

  let markdown = `# 🚨 BoxLog Breaking Changes

このドキュメントは、BoxLogアプリケーションの破壊的変更（Breaking Changes）の記録です。
アップグレード時の影響評価とマイグレーション計画の参考にしてください。

## 📋 記録フォーマット

各破壊的変更には以下の情報を含めています：

- **変更内容**: 何が変更されたか
- **影響範囲**: 誰・何に影響するか
- **マイグレーション**: 対応方法・手順
- **理由**: なぜ変更が必要だったか
- **回避方法**: 可能な場合の代替手段

---

`

  // バージョンごとにグループ化
  const versionGroups = groupChangesByVersion(sortedChanges)

  Object.entries(versionGroups).forEach(([version, versionChanges]) => {
    const summary = generateVersionSummary(version)

    markdown += `## ${version} (${versionChanges[0]!.releaseDate})\n\n`

    if (versionChanges.length > 1) {
      markdown += `### 📊 概要\n\n`
      markdown += `- **変更総数**: ${summary.totalChanges}\n`
      markdown += `- **必須マイグレーション**: ${summary.requiredMigrations}件\n`
      markdown += `- **推定作業時間**: ${Math.round(summary.totalMigrationTime / 60)}時間\n`
      markdown += `- **影響度別**: `

      Object.entries(summary.byImpact)
        .filter(([, count]) => count > 0)
        .forEach(([level, count]) => {
          const emoji = getImpactEmoji(level as ImpactLevel)
          markdown += `${emoji}${level}:${count} `
        })

      markdown += `\n\n`
    }

    versionChanges.forEach((change) => {
      markdown += `### ${getChangeEmoji(change.type)} ${change.title}\n\n`
      markdown += `**変更内容:**\n${change.description}\n\n`

      // 影響範囲
      markdown += `**影響範囲:**\n`
      change.affectedGroups.forEach((group) => {
        const emoji = getGroupEmoji(group)
        markdown += `- ${emoji} **${getGroupDisplayName(group)}**: 影響あり\n`
      })
      markdown += `\n`

      // マイグレーション
      if (change.migration.steps.length > 0) {
        markdown += `**マイグレーション:**\n`
        if (change.migration.automationScript) {
          markdown += `\`\`\`bash\n# 自動マイグレーション\n${change.migration.automationScript}\n\`\`\`\n\n`
        } else {
          markdown += `\`\`\`bash\n`
          change.migration.steps.forEach((step, index) => {
            markdown += `# ${index + 1}. ${step.title}\n`
            if (step.command) {
              markdown += `${step.command}\n`
            }
          })
          markdown += `\`\`\`\n\n`
        }
      }

      markdown += `**理由:** ${change.reason}\n\n`

      // 回避方法
      if (change.workaround) {
        markdown += `**回避方法:** ${change.workaround.description}\n\n`
      }

      markdown += `---\n\n`
    })
  })

  // フッター情報
  markdown += `
## 📞 サポート

アップグレードでお困りの場合は、[GitHub Issues](https://github.com/t3-nico/boxlog-app/issues)で報告してください。

---

**📝 最終更新**: ${new Date().toISOString().split('T')[0]}
**📋 記録担当**: Claude Code Development Team
`

  return markdown
}
