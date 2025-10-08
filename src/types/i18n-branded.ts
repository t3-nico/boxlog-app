/**
 * i18n文字列のブランド型定義
 *
 * TypeScript公式のBranded Types パターンを使用して、
 * 翻訳済み文字列と生の文字列を型レベルで区別します。
 *
 * 参考: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates
 */

/**
 * 翻訳済み文字列を表すブランド型
 *
 * この型は、t()関数から返された文字列にのみ付与されます。
 * ハードコードされた文字列（'こんにちは'や'Hello'）は、この型を持たないため、
 * TranslatedStringを要求するコンポーネントに渡すことができません。
 *
 * @example
 * ```tsx
 * // ✅ OK: t()の戻り値
 * const title: TranslatedString = t('page.title')
 *
 * // ❌ エラー: 生の文字列は型エラー
 * const title: TranslatedString = 'こんにちは'  // Type 'string' is not assignable
 * ```
 */
export type TranslatedString = string & {
  readonly __brand: 'TranslatedString'
}

/**
 * 生の文字列を TranslatedString として型アサーションする（内部使用のみ）
 *
 * この関数は i18n ライブラリ内部でのみ使用されるべきです。
 * アプリケーションコードで使用すると、型安全性が損なわれます。
 *
 * @internal
 */
export function markAsTranslated(str: string): TranslatedString {
  return str as TranslatedString
}

/**
 * TranslatedString を通常の string に変換
 *
 * 外部APIやログ出力など、TranslatedString型を受け付けない場面で使用します。
 */
export function unwrapTranslated(str: TranslatedString): string {
  return str
}

/**
 * 複数のTranslatedStringを結合
 */
export function joinTranslated(strings: TranslatedString[], separator: string = ''): TranslatedString {
  return markAsTranslated(strings.map(unwrapTranslated).join(separator))
}

/**
 * 文字列が翻訳済みかどうかを型ガードで判定
 *
 * 実行時には常にtrueを返しますが、TypeScriptの型推論に使用します。
 */
export function isTranslated(str: string): str is TranslatedString {
  // ブランド型は実行時には存在しないため、常にtrueを返す
  // この関数は型推論のためにのみ使用される
  return true
}
