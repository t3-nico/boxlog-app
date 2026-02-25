#!/usr/bin/env node
/**
 * CLAUDE.md Rule Violation Detector
 *
 * Detects violations of CLAUDE.md coding rules in the codebase:
 * - Usage of prohibited `any` type
 * - Usage of `export default` outside Next.js App Router
 * - Usage of deprecated `React.FC`
 * - Direct color/size values instead of theme tokens
 *
 * Part of Issue #582 Phase 4-2: Rule Violation Auto-detection
 *
 * Usage: node scripts/validate-claude-rules.js
 *
 * Exit codes:
 *   0: No violations found
 *   1: Violations found (non-blocking warning)
 */

import { glob } from 'glob';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// App Router file patterns (export default is required)
const APP_ROUTER_PATTERNS = [
  '**/app/**/page.tsx',
  '**/app/**/layout.tsx',
  '**/app/**/error.tsx',
  '**/app/**/loading.tsx',
  '**/app/**/not-found.tsx',
  '**/app/**/route.ts',
  '**/app/**/template.tsx',
  '**/app/**/default.tsx',
];

/**
 * Check if file is an App Router component
 */
function isAppRouterFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  return APP_ROUTER_PATTERNS.some((pattern) => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'));
    return regex.test(relativePath);
  });
}

/**
 * Detect `any` type usage
 */
function detectAnyType(content, filePath) {
  const violations = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

    // Match `: any` type annotations
    const anyTypeRegex = /:\s*any\b/g;
    let _match;

    while ((_match = anyTypeRegex.exec(line)) !== null) {
      violations.push({
        type: 'any-type',
        file: filePath,
        line: index + 1,
        content: line.trim(),
        severity: 'error',
      });
    }
  });

  return violations;
}

/**
 * Detect `export default` outside App Router
 */
function detectExportDefault(content, filePath) {
  // Skip if App Router file (export default is required)
  if (isAppRouterFile(filePath)) return [];

  const violations = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

    // Match export default
    if (/export\s+default\b/.test(line)) {
      violations.push({
        type: 'export-default',
        file: filePath,
        line: index + 1,
        content: line.trim(),
        severity: 'warning',
      });
    }
  });

  return violations;
}

/**
 * Detect `React.FC` usage
 */
function detectReactFC(content, filePath) {
  const violations = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

    // Match React.FC or React.FunctionComponent
    if (/React\.(FC|FunctionComponent)\b/.test(line)) {
      violations.push({
        type: 'react-fc',
        file: filePath,
        line: index + 1,
        content: line.trim(),
        severity: 'warning',
      });
    }
  });

  return violations;
}

/**
 * Detect direct Tailwind color classes (should use semantic tokens)
 */
function detectDirectColors(content, filePath) {
  const violations = [];
  const lines = content.split('\n');

  // Common color classes to detect
  const colorPatterns = [
    /className="[^"]*\b(bg|text|border)-(white|black|gray|red|blue|green|yellow|purple|pink|indigo)-\d{2,3}\b/g,
    /className='[^']*\b(bg|text|border)-(white|black|gray|red|blue|green|yellow|purple|pink|indigo)-\d{2,3}\b/g,
  ];

  lines.forEach((line, index) => {
    // Skip if line contains semantic tokens
    if (
      line.includes('bg-card') ||
      line.includes('text-foreground') ||
      line.includes('border-border')
    )
      return;

    colorPatterns.forEach((pattern) => {
      if (pattern.test(line)) {
        violations.push({
          type: 'direct-color',
          file: filePath,
          line: index + 1,
          content: line.trim(),
          severity: 'info',
        });
      }
    });
  });

  return violations;
}

/**
 * Validate a single file
 */
function validateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations = [];

  violations.push(...detectAnyType(content, filePath));
  violations.push(...detectExportDefault(content, filePath));
  violations.push(...detectReactFC(content, filePath));
  violations.push(...detectDirectColors(content, filePath));

  return violations;
}

/**
 * Format violations as JSON for GitHub Actions
 */
function formatViolationsJSON(violations) {
  const grouped = violations.reduce((acc, v) => {
    acc[v.type] = acc[v.type] || [];
    acc[v.type].push(v);
    return acc;
  }, {});

  return JSON.stringify(grouped, null, 2);
}

/**
 * Main validation function
 */
async function main() {
  console.log(`${colors.cyan}🚨 CLAUDE.md Rule Violation Detector${colors.reset}\n`);

  // Find all TypeScript/TSX files in src
  const files = await glob('src/**/*.{ts,tsx}', {
    cwd: ROOT_DIR,
    ignore: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/__tests__/**'],
    absolute: true,
  });

  console.log(`${colors.blue}Checking ${files.length} files...${colors.reset}\n`);

  const allViolations = [];

  for (const file of files) {
    const violations = validateFile(file);
    allViolations.push(...violations);
  }

  // Group by severity
  const errors = allViolations.filter((v) => v.severity === 'error');
  const warnings = allViolations.filter((v) => v.severity === 'warning');
  const infos = allViolations.filter((v) => v.severity === 'info');

  // Display results
  if (errors.length > 0) {
    console.log(`${colors.red}❌ Errors (${errors.length}):${colors.reset}`);
    errors.forEach((v) => {
      const relativePath = path.relative(ROOT_DIR, v.file);
      console.log(`  ${relativePath}:${v.line}`);
      console.log(`    ${colors.yellow}${v.content}${colors.reset}`);
      console.log(
        `    ${colors.red}Rule: ${v.type === 'any-type' ? 'No `any` type allowed' : v.type}${colors.reset}\n`,
      );
    });
  }

  if (warnings.length > 0) {
    console.log(`${colors.yellow}⚠️  Warnings (${warnings.length}):${colors.reset}`);
    warnings.forEach((v) => {
      const relativePath = path.relative(ROOT_DIR, v.file);
      console.log(`  ${relativePath}:${v.line}`);
      console.log(`    ${colors.yellow}${v.content}${colors.reset}`);
      console.log(`    ${colors.yellow}Rule: ${v.type}${colors.reset}\n`);
    });
  }

  if (infos.length > 0) {
    console.log(`${colors.blue}ℹ️  Info (${infos.length}):${colors.reset}`);
    console.log(
      `  ${infos.length} instances of direct color classes found (consider using semantic tokens)\n`,
    );
  }

  // Write violations to file for GitHub Actions
  if (allViolations.length > 0) {
    const violationsJSON = formatViolationsJSON(allViolations);
    fs.writeFileSync(path.join(ROOT_DIR, '.violations.json'), violationsJSON);
  }

  // Summary
  console.log('='.repeat(60));
  if (allViolations.length === 0) {
    console.log(`${colors.green}✅ No rule violations found!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(
      `${colors.yellow}⚠️  Found ${allViolations.length} violation(s) (${errors.length} errors, ${warnings.length} warnings, ${infos.length} info)${colors.reset}`,
    );
    console.log(`${colors.cyan}See CLAUDE.md for coding guidelines${colors.reset}`);

    // Exit with error only if there are actual errors
    process.exit(errors.length > 0 ? 1 : 0);
  }
}

main().catch((error) => {
  console.error(`${colors.red}Error:${colors.reset}`, error.message);
  process.exit(1);
});
