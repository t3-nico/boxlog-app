#!/usr/bin/env node
/**
 * 未使用変数を_プレフィックス付きに一括変換
 * ESLintの unused-imports/no-unused-vars 警告を解決
 */

const { execSync } = require('child_process')
const fs = require('fs')

// ESLintから未使用変数のリストを取得
function getUnusedVars() {
  try {
    const lintOutput = execSync('npm run lint 2>/dev/null', { encoding: 'utf8' })
    const lines = lintOutput.split('\n')
    const unusedVars = []
    
    for (const line of lines) {
      // unused-imports/no-unused-vars の行をパース
      const match = line.match(/^(.+):(\d+):(\d+)\s+warning\s+'(.+?)' is (?:defined|assigned).+unused-imports\/no-unused-vars/)
      if (match && !match[4].startsWith('_')) {
        const [, filePath, lineNum, column, varName] = match
        unusedVars.push({
          file: filePath,
          line: parseInt(lineNum),
          column: parseInt(column),
          varName: varName
        })
      }
    }
    
    return unusedVars
  } catch (error) {
    console.error('ESLint実行エラー:', error.message)
    return []
  }
}

// ファイル内の変数名を_プレフィックス付きに変換
function updateFile(filePath, updates) {
  if (!fs.existsSync(filePath)) {
    console.warn(`ファイルが見つかりません: ${filePath}`)
    return
  }
  
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  
  // 行番号でソートして逆順で処理（行番号がずれないように）
  updates.sort((a, b) => b.line - a.line)
  
  for (const update of updates) {
    const lineIndex = update.line - 1
    if (lineIndex >= 0 && lineIndex < lines.length) {
      const line = lines[lineIndex]
      
      // 変数名を _ プレフィックス付きに置換
      // パターン: const varName, let varName, function(varName), { varName }, (varName) など
      const patterns = [
        new RegExp(`\\b(const|let|var)\\s+${update.varName}\\b`, 'g'),
        new RegExp(`\\b${update.varName}\\s*[:=]`, 'g'),
        new RegExp(`\\(\\s*${update.varName}\\s*[,)]`, 'g'),
        new RegExp(`{\\s*${update.varName}\\s*[,}]`, 'g'),
        new RegExp(`\\b${update.varName}\\s*=>`, 'g')
      ]
      
      let updatedLine = line
      for (const pattern of patterns) {
        updatedLine = updatedLine.replace(pattern, (match) => {
          return match.replace(new RegExp(`\\b${update.varName}\\b`), `_${update.varName}`)
        })
      }
      
      if (updatedLine !== line) {
        lines[lineIndex] = updatedLine
        console.log(`✓ ${filePath}:${update.line} ${update.varName} -> _${update.varName}`)
      }
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'))
}

// メイン処理
function main() {
  console.log('🔍 未使用変数を検索中...')
  const unusedVars = getUnusedVars()
  
  if (unusedVars.length === 0) {
    console.log('✅ 未使用変数は見つかりませんでした')
    return
  }
  
  console.log(`📝 ${unusedVars.length}個の未使用変数を発見`)
  
  // ファイルごとにグループ化
  const fileGroups = {}
  for (const uvar of unusedVars) {
    if (!fileGroups[uvar.file]) {
      fileGroups[uvar.file] = []
    }
    fileGroups[uvar.file].push(uvar)
  }
  
  // ファイルごとに更新
  for (const [filePath, updates] of Object.entries(fileGroups)) {
    updateFile(filePath, updates)
  }
  
  console.log('\n🎉 未使用変数のクリーンアップ完了!')
  console.log('再度ESLintを実行して確認してください: npm run lint')
}

main()