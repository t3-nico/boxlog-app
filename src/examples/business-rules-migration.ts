/**
 * 既存コードのビジネスルール辞書移行例
 *
 * Issue #347: 既存コード統合・ドキュメント・テスト完備
 * Before/After の実装例を示し、移行パターンを提供
 */

import { businessRuleRegistry, createRule, createValidationRule } from '@/config/business-rules'

// ===== BEFORE: 既存の直接バリデーション実装 =====

/**
 * 従来のユーザー作成関数（移行前）
 */
export function createUserBefore(userData: any): Promise<any> {
  // 直接バリデーション実装（問題のあるパターン）
  if (!userData.email || !/^[^@]+@[^@]+\.[^@]+$/.test(userData.email)) {
    throw new Error('有効なメールアドレスを入力してください')
  }

  if (!userData.password || userData.password.length < 8) {
    throw new Error('パスワードは8文字以上必要です')
  }

  if (!userData.name || userData.name.trim().length < 1) {
    throw new Error('名前は必須です')
  }

  if (userData.age && (userData.age < 18 || userData.age > 120)) {
    throw new Error('年齢は18-120歳の範囲で入力してください')
  }

  // ユーザー作成処理
  return Promise.resolve({ id: 'user-id', ...userData })
}

/**
 * 従来のタスク更新関数（移行前）
 */
export function updateTaskBefore(taskId: string, updateData: any, user: any): Promise<any> {
  // 直接権限チェック（問題のあるパターン）
  if (!user.permissions.includes('task:update')) {
    throw new Error('タスク更新権限がありません')
  }

  // 直接バリデーション
  if (updateData.title && updateData.title.trim().length < 3) {
    throw new Error('タスクタイトルは3文字以上必要です')
  }

  if (updateData.priority && !['low', 'medium', 'high'].includes(updateData.priority)) {
    throw new Error('優先度は low, medium, high のいずれかを選択してください')
  }

  // タスク更新処理
  return Promise.resolve({ id: taskId, ...updateData })
}

// ===== AFTER: ビジネスルール辞書移行後 =====

/**
 * Step 1: ビジネスルール定義
 */
function defineBusinessRules() {
  // ユーザー関連ルール
  const userEmailRule = createValidationRule(
    'user-email-validation',
    'メール形式検証',
    ['user'],
    (data) => data.email && /^[^@]+@[^@]+\.[^@]+$/.test(data.email),
    '有効なメールアドレスを入力してください'
  )

  const userPasswordRule = createValidationRule(
    'user-password-validation',
    'パスワード強度検証',
    ['user'],
    (data) => data.password && data.password.length >= 8,
    'パスワードは8文字以上必要です'
  )

  const userNameRule = createValidationRule(
    'user-name-validation',
    '名前必須検証',
    ['user'],
    (data) => data.name && data.name.trim().length >= 1,
    '名前は必須です'
  )

  const userAgeRule = createValidationRule(
    'user-age-validation',
    '年齢範囲検証',
    ['user'],
    (data) => !data.age || (data.age >= 18 && data.age <= 120),
    '年齢は18-120歳の範囲で入力してください'
  )

  // タスク関連ルール
  const taskPermissionRule = createRule(
    'task-update-permission',
    'タスク更新権限',
    'タスク更新権限の検証',
    'permission',
    ['task'],
    ({ user }) => ({
      valid: user?.permissions?.includes('task:update') || false,
      message: user?.permissions?.includes('task:update') ? undefined : 'タスク更新権限がありません',
    })
  )

  const taskTitleRule = createValidationRule(
    'task-title-validation',
    'タスクタイトル検証',
    ['task'],
    (data) => !data.title || data.title.trim().length >= 3,
    'タスクタイトルは3文字以上必要です'
  )

  const taskPriorityRule = createValidationRule(
    'task-priority-validation',
    'タスク優先度検証',
    ['task'],
    (data) => !data.priority || ['low', 'medium', 'high'].includes(data.priority),
    '優先度は low, medium, high のいずれかを選択してください'
  )

  // ルール登録
  const rules = [
    userEmailRule,
    userPasswordRule,
    userNameRule,
    userAgeRule,
    taskPermissionRule,
    taskTitleRule,
    taskPriorityRule,
  ]

  rules.forEach((rule) => businessRuleRegistry.register(rule))
}

/**
 * Step 2: 移行後のユーザー作成関数
 */
export async function createUserAfter(userData: any): Promise<any> {
  // ビジネスルール辞書による検証
  const validationResults = await businessRuleRegistry.validate('user', userData)

  // エラーチェック
  const errors = validationResults.filter((result) => !result.result.valid)
  if (errors.length > 0) {
    const errorMessages = errors.map((error) => error.result.message).join(', ')
    throw new Error(errorMessages)
  }

  // ユーザー作成処理（バリデーション済み）
  return Promise.resolve({ id: 'user-id', ...userData })
}

/**
 * Step 3: 移行後のタスク更新関数
 */
export async function updateTaskAfter(taskId: string, updateData: any, user: any): Promise<any> {
  // ビジネスルール辞書による検証（権限チェック込み）
  const validationResults = await businessRuleRegistry.validate('task', updateData, user)

  // エラーチェック
  const errors = validationResults.filter((result) => !result.result.valid)
  if (errors.length > 0) {
    const errorMessages = errors.map((error) => error.result.message).join(', ')
    throw new Error(errorMessages)
  }

  // タスク更新処理（バリデーション・権限チェック済み）
  return Promise.resolve({ id: taskId, ...updateData })
}

// ===== 移行パターン実行例 =====

/**
 * 移行パターンのデモンストレーション
 */
export async function migrationDemo() {
  console.log('🔄 ビジネスルール辞書移行デモ開始')

  // Step 1: ルール定義
  defineBusinessRules()
  console.log('✅ ビジネスルール定義完了')

  // Step 2: 移行前後の比較テスト
  const testUserData = {
    email: 'test@example.com',
    password: 'securepassword123',
    name: 'テストユーザー',
    age: 25,
  }

  const testTaskData = {
    title: '新しいタスク',
    priority: 'medium',
  }

  const testUser = {
    id: 'user-1',
    permissions: ['task:update', 'task:read'],
  }

  try {
    // 移行前の関数テスト
    console.log('📝 移行前関数テスト:')
    const beforeUserResult = await createUserBefore(testUserData)
    console.log('  ユーザー作成成功:', beforeUserResult.id)

    const beforeTaskResult = await updateTaskBefore('task-1', testTaskData, testUser)
    console.log('  タスク更新成功:', beforeTaskResult.id)

    // 移行後の関数テスト
    console.log('📝 移行後関数テスト:')
    const afterUserResult = await createUserAfter(testUserData)
    console.log('  ユーザー作成成功:', afterUserResult.id)

    const afterTaskResult = await updateTaskAfter('task-1', testTaskData, testUser)
    console.log('  タスク更新成功:', afterTaskResult.id)

    // 統計情報表示
    const stats = businessRuleRegistry.getStats()
    console.log('📊 ビジネスルール統計:')
    console.log(`  - 登録ルール数: ${stats.total}`)
    console.log(`  - アクティブルール: ${stats.active}`)
    console.log(`  - カテゴリ別: バリデーション=${stats.byCategory.validation}, 権限=${stats.byCategory.permission}`)

    console.log('🎉 移行デモ完了')
  } catch (error) {
    console.error('❌ エラー:', error.message)
  }
}

/**
 * エラーケースのデモンストレーション
 */
export async function errorCasesDemo() {
  console.log('🚫 エラーケースデモ開始')

  defineBusinessRules()

  const invalidUserData = {
    email: 'invalid-email',
    password: '123',
    name: '',
    age: 15,
  }

  const invalidTaskData = {
    title: 'ab',
    priority: 'invalid',
  }

  const unauthorizedUser = {
    id: 'user-2',
    permissions: ['task:read'],
  }

  try {
    // 無効なユーザーデータでのテスト
    console.log('📝 無効ユーザーデータテスト:')
    await createUserAfter(invalidUserData)
  } catch (error) {
    console.log('  期待通りエラー:', error.message)
  }

  try {
    // 権限のないユーザーでのタスク更新テスト
    console.log('📝 権限なしタスク更新テスト:')
    await updateTaskAfter('task-1', invalidTaskData, unauthorizedUser)
  } catch (error) {
    console.log('  期待通りエラー:', error.message)
  }

  console.log('✅ エラーケースデモ完了')
}

// ===== パフォーマンス比較 =====

/**
 * 移行前後のパフォーマンス比較
 */
export async function performanceComparison() {
  console.log('⚡ パフォーマンス比較開始')

  defineBusinessRules()

  const testData = {
    email: 'performance@example.com',
    password: 'performancetest123',
    name: 'Performance User',
    age: 30,
  }

  const iterations = 1000

  // 移行前のパフォーマンス
  const beforeStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    await createUserBefore(testData)
  }
  const beforeEnd = performance.now()

  // 移行後のパフォーマンス
  const afterStart = performance.now()
  for (let i = 0; i < iterations; i++) {
    await createUserAfter(testData)
  }
  const afterEnd = performance.now()

  console.log('📊 パフォーマンス結果:')
  console.log(`  移行前: ${(beforeEnd - beforeStart).toFixed(2)}ms (${iterations}回)`)
  console.log(`  移行後: ${(afterEnd - afterStart).toFixed(2)}ms (${iterations}回)`)
  console.log(
    `  1回平均: 移行前=${((beforeEnd - beforeStart) / iterations).toFixed(3)}ms, 移行後=${((afterEnd - afterStart) / iterations).toFixed(3)}ms`
  )

  const overhead = ((afterEnd - afterStart) / (beforeEnd - beforeStart) - 1) * 100
  console.log(`  オーバーヘッド: ${overhead > 0 ? '+' : ''}${overhead.toFixed(1)}%`)

  console.log('✅ パフォーマンス比較完了')
}

// 実行用関数のエクスポート
export const migrationExamples = {
  migrationDemo,
  errorCasesDemo,
  performanceComparison,
}
