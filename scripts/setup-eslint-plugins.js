#!/usr/bin/env node

/**
 * ESLintプラグイン自動セットアップスクリプト
 * 
 * npm install 後に自動実行され、カスタムESLintプラグインを
 * node_modules に適切に配置します。
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 ESLintプラグインの自動セットアップを開始...');

const plugins = [
  {
    name: 'eslint-plugin-boxlog-theme',
    source: 'config/eslint/custom-rules/theme',
    description: 'BoxLog Theme System enforcement rules'
  },
  {
    name: 'eslint-plugin-boxlog-compliance',
    source: 'config/eslint/custom-rules/compliance',
    description: 'International compliance rules (GDPR, SOC 2, WCAG)'
  },
  {
    name: 'eslint-plugin-boxlog-todo',
    source: 'config/eslint/custom-rules/todo',
    description: 'BoxLog TODO/FIXME Structured Comments Rules'
  }
];

let successCount = 0;
let errorCount = 0;

plugins.forEach(plugin => {
  try {
    console.log(`📦 Setting up ${plugin.name}...`);
    
    const targetDir = path.join('node_modules', plugin.name);
    const sourceDir = path.join(process.cwd(), plugin.source);
    
    // ソースディレクトリの存在確認
    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Source directory not found: ${sourceDir}`);
    }
    
    // ターゲットディレクトリの作成
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // package.json作成
    const packageJson = {
      name: plugin.name,
      version: "1.0.0",
      description: plugin.description,
      main: "index.js",
      keywords: ["eslint", "eslintplugin", "boxlog"],
      author: "BoxLog Team",
      license: "MIT",
      peerDependencies: {
        eslint: ">= 8.0.0"
      }
    };
    
    fs.writeFileSync(
      path.join(targetDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // ソースファイルのコピー
    const sourceFiles = fs.readdirSync(sourceDir);
    sourceFiles.forEach(file => {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
    
    console.log(`✅ ${plugin.name} setup completed`);
    console.log(`   📄 Files: ${sourceFiles.length}`);
    console.log(`   📁 Target: ${targetDir}`);
    
    successCount++;
    
  } catch (error) {
    console.error(`❌ Failed to setup ${plugin.name}:`, error.message);
    errorCount++;
  }
});

// 結果サマリー
console.log('\n' + '='.repeat(50));
console.log('📊 Setup Summary');
console.log('='.repeat(50));
console.log(`✅ Successful: ${successCount}`);
console.log(`❌ Failed: ${errorCount}`);

if (successCount > 0) {
  console.log('\n🚀 Available ESLint commands:');
  console.log('   npm run lint:all                # 全てのlintを実行');
  console.log('   npm run lint:theme:eslint       # Theme違反チェック');
  console.log('   npm run lint:compliance         # コンプライアンスチェック');
}

if (errorCount > 0) {
  console.log('\n⚠️ Some plugins failed to setup. Please check the errors above.');
  process.exit(1);
} else {
  console.log('\n🎉 All ESLint plugins setup completed successfully!');
}

// 設定ファイルの整合性チェック
console.log('\n🔍 Configuration validation...');

const mainConfig = path.join('config/eslint/.eslintrc.json');
const complianceConfig = path.join('config/eslint/.eslintrc.compliance.json');

try {
  // メイン設定ファイルのチェック
  if (fs.existsSync(mainConfig)) {
    const config = JSON.parse(fs.readFileSync(mainConfig, 'utf8'));
    if (config.plugins && config.plugins.includes('boxlog-theme')) {
      console.log('✅ Main ESLint config is valid');
    } else {
      console.log('⚠️ Main ESLint config might be missing boxlog-theme plugin');
    }
  }
  
  // コンプライアンス設定ファイルのチェック
  if (fs.existsSync(complianceConfig)) {
    const config = JSON.parse(fs.readFileSync(complianceConfig, 'utf8'));
    if (config.plugins && config.plugins.includes('boxlog-compliance')) {
      console.log('✅ Compliance ESLint config is valid');
    } else {
      console.log('⚠️ Compliance ESLint config might be missing boxlog-compliance plugin');
    }
  }
  
} catch (error) {
  console.log('⚠️ Could not validate configuration files:', error.message);
}

console.log('\n🛡️ ESLint plugin setup completed. Your code is now protected by BoxLog quality standards!');