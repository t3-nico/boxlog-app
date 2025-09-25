/**
 * セキュリティテストスクリプト
 * DOMPurify実装のXSS対策を検証
 */

const fs = require('fs')
const path = require('path')

// DOMPurifyをインポート
const createDOMPurify = require('dompurify')

// DOMPurifyをNode.js環境で使用するためのセットアップ
const { JSDOM } = require('jsdom')

// JSDOMを使ってブラウザ環境をシミュレート
const window = new JSDOM('').window
global.window = window
global.document = window.document
const DOMPurify = createDOMPurify(window)

// BoxLogのsanitize関数をシミュレート（実際の設定を再現）
const BASIC_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'span'],
  ALLOWED_ATTR: ['class'],
  FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror'],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
}

const RICH_TEXT_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'a', 'span', 'div'
  ],
  ALLOWED_ATTR: ['href', 'class', 'target', 'rel'],
  FORBID_ATTR: ['style', 'onclick', 'onload', 'onerror', 'javascript'],
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe'],
  ALLOW_DATA_ATTR: false,
}

// Sanitize関数の実装
function sanitizeBasicHTML(html) {
  if (!html || typeof html !== 'string') return ''
  return DOMPurify.sanitize(html, BASIC_CONFIG)
}

function sanitizeRichText(html) {
  if (!html || typeof html !== 'string') return ''
  return DOMPurify.sanitize(html, RICH_TEXT_CONFIG)
}

// XSS攻撃テストケース
const XSS_TEST_CASES = {
  scriptTag: '<script>alert("XSS")</script>',
  imgOnError: '<img src="invalid" onerror="alert(\'XSS\')">',
  linkJavascript: '<a href="javascript:alert(\'XSS\')">Click me</a>',
  styleExpression: '<div style="expression(alert(\'XSS\'))">Test</div>',
  svgOnLoad: '<svg onload="alert(\'XSS\')">',
  iframeDataUri: '<iframe src="data:text/html,<script>alert(\'XSS\')</script>"></iframe>',
  objectData: '<object data="javascript:alert(\'XSS\')">',
  embedSrc: '<embed src="javascript:alert(\'XSS\')">',
  formAction: '<form><button formaction="javascript:alert(\'XSS\')">Submit</button></form>',
  metaRefresh: '<meta http-equiv="refresh" content="0;url=javascript:alert(\'XSS\')">'
}

// テスト実行関数
function testSanitization(input, sanitizeFunction) {
  const output = sanitizeFunction(input)
  const detectedThreats = []

  // 危険なパターンをチェック
  if (output.includes('<script')) detectedThreats.push('script tag')
  if (output.includes('javascript:')) detectedThreats.push('javascript protocol')
  if (output.includes('onerror')) detectedThreats.push('onerror handler')
  if (output.includes('onload')) detectedThreats.push('onload handler')
  if (output.includes('expression(')) detectedThreats.push('CSS expression')
  if (output.includes('eval(')) detectedThreats.push('eval function')

  return {
    input,
    output,
    isSafe: detectedThreats.length === 0,
    detectedThreats
  }
}

// 全テスト実行
function runAllTests(sanitizeFunction, functionName) {
  console.log(`\n🔒 ${functionName} テスト実行中...`)
  console.log('='.repeat(60))

  const results = Object.entries(XSS_TEST_CASES).map(([name, testCase]) => {
    const result = testSanitization(testCase, sanitizeFunction)
    console.log(`\n📋 テスト: ${name}`)
    console.log(`入力: ${result.input}`)
    console.log(`出力: ${result.output}`)
    console.log(`安全: ${result.isSafe ? '✅ 安全' : '❌ 危険'}`)
    if (result.detectedThreats.length > 0) {
      console.log(`検出された脅威: ${result.detectedThreats.join(', ')}`)
    }

    return {
      testName: name,
      ...result
    }
  })

  const passedTests = results.filter(r => r.isSafe).length
  const totalTests = results.length

  console.log(`\n📊 ${functionName} テスト結果サマリー`)
  console.log('='.repeat(40))
  console.log(`合格: ${passedTests}/${totalTests} テスト`)
  console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`)

  return {
    results,
    summary: {
      passed: passedTests,
      failed: totalTests - passedTests,
      total: totalTests,
      passRate: `${((passedTests / totalTests) * 100).toFixed(1)}%`
    }
  }
}

// メイン実行
console.log('🚀 BoxLog DOMPurify セキュリティテスト開始')
console.log('=' .repeat(60))

// 基本HTML sanitization テスト
const basicResults = runAllTests(sanitizeBasicHTML, 'sanitizeBasicHTML')

// リッチテキスト sanitization テスト
const richTextResults = runAllTests(sanitizeRichText, 'sanitizeRichText')

// 結果レポート生成
const report = {
  timestamp: new Date().toISOString(),
  testResults: {
    sanitizeBasicHTML: basicResults,
    sanitizeRichText: richTextResults
  },
  overallSummary: {
    totalTests: basicResults.summary.total * 2,
    totalPassed: basicResults.summary.passed + richTextResults.summary.passed,
    overallPassRate: ((basicResults.summary.passed + richTextResults.summary.passed) / (basicResults.summary.total * 2) * 100).toFixed(1) + '%'
  }
}

// レポートを保存
const reportPath = path.join(__dirname, '../.security-test-report.json')
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

console.log('\n🎯 総合結果')
console.log('='.repeat(30))
console.log(`総テスト数: ${report.overallSummary.totalTests}`)
console.log(`総合格数: ${report.overallSummary.totalPassed}`)
console.log(`総合成功率: ${report.overallSummary.overallPassRate}`)
console.log(`\n📄 詳細レポート: ${reportPath}`)

// 正常なHTMLの処理テスト
console.log('\n🧪 正常なHTMLの処理テスト')
console.log('='.repeat(40))

const validHTML = `
<div>
  <h2>正常なコンテンツ</h2>
  <p>これは<strong>安全な</strong>HTMLコンテンツです。</p>
  <a href="https://example.com" target="_blank" rel="noopener">リンク</a>
</div>
`

console.log('入力HTML:')
console.log(validHTML)
console.log('\nsanitizeRichText出力:')
console.log(sanitizeRichText(validHTML))

console.log('\n✅ セキュリティテスト完了')