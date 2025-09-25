/**
 * フォントシステムのテスト
 */

import {
  applyLocaleFont,
  fontFamilies,
  fontSystem,
  fontWeights,
  generateFontCSSVariables,
  getFontFamily,
  getFontFamilyString,
  getFontPrefetchUrls,
  getFontPreloadUrls,
  getFullFontConfig,
  getRecommendedWeight,
  getSupportedFontLocales,
} from '../fonts'

describe('Font System', () => {
  describe('fontFamilies', () => {
    it('必要なフォントファミリーが定義されている', () => {
      expect(fontFamilies.latin.sans).toContain('Inter')
      expect(fontFamilies.japanese.sans).toContain('Inter')
      expect(fontFamilies.japanese.sans).toContain('"Noto Sans JP"')
      expect(fontFamilies.chinese.sans).toContain('"Noto Sans SC"')
      expect(fontFamilies.korean.sans).toContain('"Noto Sans KR"')
      expect(fontFamilies.arabic.sans).toContain('"Noto Sans Arabic"')
    })

    it('すべてのフォントファミリーにsansとmonoが存在', () => {
      Object.values(fontFamilies).forEach((family) => {
        expect(family.sans).toBeDefined()
        expect(family.mono).toBeDefined()
        expect(Array.isArray(family.sans)).toBe(true)
        expect(Array.isArray(family.mono)).toBe(true)
      })
    })

    it('monoフォントにJetBrains Monoが含まれている', () => {
      Object.values(fontFamilies).forEach((family) => {
        expect(family.mono).toContain('JetBrains Mono')
      })
    })
  })

  describe('getFontFamily', () => {
    it('英語ロケールで正しいフォントファミリーを返す', () => {
      const fonts = getFontFamily('en', 'sans')
      expect(fonts).toEqual(fontFamilies.latin.sans)
    })

    it('日本語ロケールで正しいフォントファミリーを返す', () => {
      const fonts = getFontFamily('ja', 'sans')
      expect(fonts).toEqual(fontFamilies.japanese.sans)
      expect(fonts).toContain('"Noto Sans JP"')
    })

    it('サポートされていないロケールでデフォルトを返す', () => {
      const fonts = getFontFamily('unknown' as any, 'sans')
      expect(fonts).toEqual(fontFamilies.default.sans)
    })

    it('monoフォントタイプで正しく動作', () => {
      const fonts = getFontFamily('ja', 'mono')
      expect(fonts).toEqual(fontFamilies.japanese.mono)
    })
  })

  describe('getFontFamilyString', () => {
    it('CSS font-family文字列を正しく生成', () => {
      const fontString = getFontFamilyString('ja', 'sans')
      expect(typeof fontString).toBe('string')
      expect(fontString).toContain('Inter')
      expect(fontString).toContain('"Noto Sans JP"')
      expect(fontString.includes(', ')).toBe(true)
    })

    it('英語ロケールのfont-family文字列', () => {
      const fontString = getFontFamilyString('en', 'sans')
      expect(fontString).toContain('Inter')
      expect(fontString).toContain('system-ui')
    })
  })

  describe('fontWeights', () => {
    it('必要なフォント重みが定義されている', () => {
      expect(fontWeights.normal).toBe('400')
      expect(fontWeights.medium).toBe('500')
      expect(fontWeights.semibold).toBe('600')
      expect(fontWeights.bold).toBe('700')
    })
  })

  describe('getRecommendedWeight', () => {
    it('CJK言語でmedium重みを推奨', () => {
      expect(getRecommendedWeight('ja')).toBe('medium')
      expect(getRecommendedWeight('zh')).toBe('medium')
      expect(getRecommendedWeight('ko')).toBe('medium')
    })

    it('英語でnormal重みを推奨', () => {
      expect(getRecommendedWeight('en')).toBe('normal')
    })

    it('アラビア語でnormal重みを推奨', () => {
      expect(getRecommendedWeight('ar')).toBe('normal')
    })
  })

  describe('generateFontCSSVariables', () => {
    it('正しいCSS変数オブジェクトを生成', () => {
      const variables = generateFontCSSVariables('ja')

      expect(variables['--font-sans']).toBeDefined()
      expect(variables['--font-mono']).toBeDefined()
      expect(variables['--font-weight-normal']).toBe('400')
      expect(variables['--font-weight-medium']).toBe('500')

      expect(variables['--font-sans']).toContain('Inter')
      expect(variables['--font-sans']).toContain('Noto Sans JP')
    })

    it('英語ロケールのCSS変数', () => {
      const variables = generateFontCSSVariables('en')
      expect(variables['--font-sans']).toContain('Inter')
      expect(variables['--font-sans']).toContain('system-ui')
    })
  })

  describe('getFontPreloadUrls', () => {
    it('必要なフォントURLを返す', () => {
      const urls = getFontPreloadUrls('ja')
      expect(Array.isArray(urls)).toBe(true)
      expect(urls.length).toBeGreaterThan(0)

      // Interは全言語で含まれる
      expect(urls.some((url) => url.includes('Inter'))).toBe(true)

      // 日本語の場合Noto Sans JPが含まれる
      expect(urls.some((url) => url.includes('Noto+Sans+JP'))).toBe(true)
    })

    it('英語ロケールではInterのみ', () => {
      const urls = getFontPreloadUrls('en')
      expect(urls.some((url) => url.includes('Inter'))).toBe(true)
      expect(urls.some((url) => url.includes('Noto'))).toBe(false)
    })

    it('各言語で適切なNotoフォントURL', () => {
      const zhUrls = getFontPreloadUrls('zh')
      expect(zhUrls.some((url) => url.includes('Noto+Sans+SC'))).toBe(true)

      const koUrls = getFontPreloadUrls('ko')
      expect(koUrls.some((url) => url.includes('Noto+Sans+KR'))).toBe(true)

      const arUrls = getFontPreloadUrls('ar')
      expect(arUrls.some((url) => url.includes('Noto+Sans+Arabic'))).toBe(true)
    })
  })

  describe('getFontPrefetchUrls', () => {
    it('現在のロケール以外のフォントURLを返す', () => {
      const prefetchUrls = getFontPrefetchUrls('en')
      const preloadUrls = getFontPreloadUrls('en')

      expect(Array.isArray(prefetchUrls)).toBe(true)

      // プリフェッチURLにプリロードURLが含まれていない
      prefetchUrls.forEach((url) => {
        expect(preloadUrls).not.toContain(url)
      })
    })

    it('日本語ロケールで他言語フォントをプリフェッチ', () => {
      const urls = getFontPrefetchUrls('ja')

      expect(urls.some((url) => url.includes('Noto+Sans+SC'))).toBe(true)
      expect(urls.some((url) => url.includes('Noto+Sans+KR'))).toBe(true)
      expect(urls.some((url) => url.includes('Noto+Sans+Arabic'))).toBe(true)

      // 自分の言語（Noto Sans JP）は含まれない
      expect(urls.some((url) => url.includes('Noto+Sans+JP'))).toBe(false)
    })
  })

  describe('applyLocaleFont', () => {
    it('既存スタイルにフォントファミリーを追加', () => {
      const originalStyle = 'text-sm font-medium text-gray-900'
      const result = applyLocaleFont(originalStyle, 'ja', 'sans')

      expect(result).toContain(originalStyle)
      expect(result).toContain('[font-family:')
      expect(result).toContain('Inter')
      expect(result).toContain('Noto Sans JP')
    })

    it('monoフォントで正しく動作', () => {
      const originalStyle = 'text-xs bg-gray-100'
      const result = applyLocaleFont(originalStyle, 'ja', 'mono')

      expect(result).toContain(originalStyle)
      expect(result).toContain('JetBrains Mono')
    })
  })

  describe('getFullFontConfig', () => {
    it('完全なフォント設定を返す', () => {
      const config = getFullFontConfig('ja')

      expect(config.locale).toBe('ja')
      expect(config.fontFamily.sans).toBeDefined()
      expect(config.fontFamily.mono).toBeDefined()
      expect(config.recommendedWeight).toBe('medium')
      expect(config.cssVariables).toBeDefined()
      expect(config.preloadUrls).toBeDefined()
      expect(config.prefetchUrls).toBeDefined()
      expect(config.classes).toBeDefined()
    })

    it('すべての必要なプロパティが含まれる', () => {
      const config = getFullFontConfig('en')
      const expectedKeys = [
        'locale',
        'fontFamily',
        'recommendedWeight',
        'cssVariables',
        'preloadUrls',
        'prefetchUrls',
        'classes',
      ]

      expectedKeys.forEach((key) => {
        expect(config).toHaveProperty(key)
      })
    })
  })

  describe('getSupportedFontLocales', () => {
    it('サポートされている言語一覧を返す', () => {
      const locales = getSupportedFontLocales()

      expect(Array.isArray(locales)).toBe(true)
      expect(locales).toContain('en')
      expect(locales).toContain('ja')
      expect(locales).toContain('zh')
      expect(locales).toContain('ko')
      expect(locales).toContain('ar')
    })
  })

  describe('fontSystem', () => {
    it('すべての関数が含まれている', () => {
      const expectedFunctions = [
        'getFontFamily',
        'getFontFamilyString',
        'getRecommendedWeight',
        'generateFontCSSVariables',
        'getFontPreloadUrls',
        'getFontPrefetchUrls',
        'applyLocaleFont',
        'getFullFontConfig',
        'getSupportedFontLocales',
      ]

      expectedFunctions.forEach((fn) => {
        expect(fontSystem).toHaveProperty(fn)
        expect(typeof fontSystem[fn as keyof typeof fontSystem]).toBe('function')
      })
    })

    it('定数オブジェクトが含まれている', () => {
      expect(fontSystem.fontFamilies).toBeDefined()
      expect(fontSystem.fontWeights).toBeDefined()
    })
  })

  describe('エラーハンドリング', () => {
    it('無効なロケールでもエラーにならない', () => {
      expect(() => getFontFamily('invalid' as any)).not.toThrow()
      expect(() => getFontFamilyString('invalid' as any)).not.toThrow()
      expect(() => getRecommendedWeight('invalid' as any)).not.toThrow()
      expect(() => generateFontCSSVariables('invalid' as any)).not.toThrow()
    })

    it('無効なフォントタイプでもエラーにならない', () => {
      expect(() => getFontFamily('en', 'invalid' as any)).not.toThrow()
      expect(() => applyLocaleFont('text-sm', 'en', 'invalid' as any)).not.toThrow()
    })
  })

  describe('統合性テスト', () => {
    it('すべてのサポート言語でフォント設定が一貫している', () => {
      const locales = getSupportedFontLocales()

      locales.forEach((locale) => {
        const config = getFullFontConfig(locale as any)

        // 基本プロパティが存在
        expect(config.fontFamily.sans).toBeTruthy()
        expect(config.fontFamily.mono).toBeTruthy()
        expect(config.recommendedWeight).toBeTruthy()

        // プリロードURLが有効な形式
        config.preloadUrls.forEach((url) => {
          expect(url).toMatch(/^https:\/\/fonts\.googleapis\.com/)
        })

        // CSS変数が正しい形式
        Object.keys(config.cssVariables).forEach((key) => {
          expect(key).toMatch(/^--font/)
        })
      })
    })

    it('InterフォントがすべてのロケールSansフォントの最初に含まれる', () => {
      const locales = getSupportedFontLocales()

      locales.forEach((locale) => {
        const fonts = getFontFamily(locale as any, 'sans')
        expect(fonts[0]).toBe('Inter')
      })
    })
  })
})
