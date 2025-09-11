#!/usr/bin/env node

/**
 * BoxLog Compliance Plugin Setup Script
 * 
 * カスタムESLintプラグインをnode_modulesにセットアップします
 */

const fs = require('fs');
const path = require('path');

const PLUGIN_NAME = 'eslint-plugin-boxlog-compliance';
const SOURCE_DIR = 'config/eslint/compliance-rules';
const TARGET_DIR = `node_modules/${PLUGIN_NAME}`;

console.log('🔧 Setting up BoxLog Compliance ESLint Plugin...');

try {
  // ターゲットディレクトリを作成
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    console.log(`📁 Created directory: ${TARGET_DIR}`);
  }

  // ソースファイルをコピー
  const sourceFiles = fs.readdirSync(SOURCE_DIR);
  
  sourceFiles.forEach(file => {
    const sourcePath = path.join(SOURCE_DIR, file);
    const targetPath = path.join(TARGET_DIR, file);
    
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`📄 Copied: ${file}`);
  });

  // package.jsonを作成
  const packageJson = {
    name: PLUGIN_NAME,
    version: '1.0.0',
    description: 'BoxLog international compliance ESLint rules',
    main: 'index.js',
    keywords: ['eslint', 'eslintplugin', 'compliance', 'gdpr', 'soc2', 'wcag'],
    author: 'BoxLog Team',
    license: 'MIT',
    peerDependencies: {
      eslint: '>= 8.0.0'
    }
  };

  fs.writeFileSync(
    path.join(TARGET_DIR, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  console.log('📦 Created package.json');

  console.log('✅ BoxLog Compliance Plugin setup completed successfully!');
  console.log('');
  console.log('🚀 You can now run compliance checks:');
  console.log('   npm run lint:compliance');
  console.log('   npm run compliance:report');
  
} catch (error) {
  console.error('❌ Plugin setup failed:', error);
  process.exit(1);
}