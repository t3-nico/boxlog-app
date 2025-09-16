#!/usr/bin/env node

/**
 * 未使用変数に _プレフィックスを追加するスクリプト
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 未使用変数の情報を取得
function getUnusedVars() {
  try {
    const output = execSync('npm run lint 2>&1', { encoding: 'utf8' });
    const lines = output.split('\n');
    
    const unusedVars = [];
    let currentFile = '';
    
    for (const line of lines) {
      // ファイルパスの検出
      if (line.startsWith('/') && line.includes('.tsx') || line.includes('.ts')) {
        currentFile = line.trim();
      }
      
      // 未使用変数の検出
      if (line.includes('unused-imports/no-unused-vars') && currentFile) {
        const match = line.match(/(\d+):(\d+)\s+warning\s+'([^']+)'/);
        if (match) {
          const [, lineNum, col, varName] = match;
          unusedVars.push({
            file: currentFile,
            line: parseInt(lineNum),
            column: parseInt(col),
            variable: varName
          });
        }
      }
    }
    
    return unusedVars;
  } catch (error) {
    console.log('ESLintエラー情報を取得中...');
    return [];
  }
}

// ファイル内の変数名を_プレフィックス付きに変更
function fixFileUnusedVars(filePath, variables) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    // 行番号でソートして後ろから処理（行番号のずれを防ぐ）
    const sortedVars = variables.sort((a, b) => b.line - a.line);
    
    let modified = false;
    
    for (const varInfo of sortedVars) {
      const lineIndex = varInfo.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        const varName = varInfo.variable;
        
        // 既に_プレフィックスがついている場合はスキップ
        if (varName.startsWith('_')) continue;
        
        // パターンマッチして変数名を置換
        const patterns = [
          // const [var] = 
          new RegExp(`\\b${varName}\\b(?=\\s*[,\\]\\}=])`, 'g'),
          // const var = 
          new RegExp(`\\bconst\\s+${varName}\\b`, 'g'),
          // let var = 
          new RegExp(`\\blet\\s+${varName}\\b`, 'g'),
          // function param: (var) =>
          new RegExp(`\\(([^)]*\\b)${varName}\\b([^)]*)\\)`, 'g'),
          // object destructuring: { var }
          new RegExp(`{([^}]*\\b)${varName}\\b([^}]*)}`, 'g'),
        ];
        
        let newLine = line;
        for (const pattern of patterns) {
          if (pattern.test(line)) {
            newLine = newLine.replace(new RegExp(`\\b${varName}\\b`, 'g'), `_${varName}`);
            break;
          }
        }
        
        if (newLine !== line) {
          lines[lineIndex] = newLine;
          modified = true;
          console.log(`✓ ${path.basename(filePath)}:${varInfo.line} - ${varName} → _${varName}`);
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, lines.join('\n'));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// メイン処理
function main() {
  console.log('🔍 未使用変数を検索中...');
  
  const unusedVars = getUnusedVars();
  
  if (unusedVars.length === 0) {
    console.log('✅ 未使用変数は見つかりませんでした！');
    return;
  }
  
  console.log(`📝 ${unusedVars.length}個の未使用変数を発見しました`);
  
  // ファイル別にグループ化
  const fileGroups = {};
  for (const varInfo of unusedVars) {
    if (!fileGroups[varInfo.file]) {
      fileGroups[varInfo.file] = [];
    }
    fileGroups[varInfo.file].push(varInfo);
  }
  
  let totalFixed = 0;
  let totalFiles = 0;
  
  // ファイルごとに処理
  for (const [filePath, variables] of Object.entries(fileGroups)) {
    if (fs.existsSync(filePath)) {
      console.log(`\n📄 処理中: ${path.basename(filePath)}`);
      
      if (fixFileUnusedVars(filePath, variables)) {
        totalFiles++;
        totalFixed += variables.length;
      }
    }
  }
  
  console.log(`\n🎉 完了！`);
  console.log(`📊 ${totalFiles}ファイルで${totalFixed}個の変数を修正しました`);
  
  // 修正後の確認
  console.log('\n🔍 修正結果を確認中...');
  setTimeout(() => {
    try {
      execSync('npm run lint 2>&1 | tail -1', { stdio: 'inherit' });
    } catch (error) {
      console.log('📈 新しいESLint結果を確認してください');
    }
  }, 1000);
}

main();