import { beforeEach, describe, expect, it } from 'vitest'

import { FuseSearch, FuzzySearch } from './search-engine'

describe('search-engine', () => {
  describe('FuseSearch', () => {
    beforeEach(() => {
      FuseSearch.clearCache()
    })

    describe('search', () => {
      const testItems = [
        { id: '1', title: 'ミーティング準備', description: '資料作成' },
        { id: '2', title: 'コードレビュー', description: 'PRの確認' },
        { id: '3', title: 'ドキュメント作成', description: '仕様書を書く' },
        { id: '4', title: 'デイリースタンドアップ', description: '朝会' },
      ]

      it('空のクエリですべてのアイテムを返す', () => {
        const results = FuseSearch.search(
          testItems,
          '',
          [{ name: 'title', weight: 1 }],
          10
        )

        expect(results).toHaveLength(4)
      })

      it('タイトルで検索できる', () => {
        const results = FuseSearch.search(
          testItems,
          'ミーティング',
          [{ name: 'title', weight: 1 }],
          10
        )

        expect(results.length).toBeGreaterThan(0)
        expect(results[0]?.item.title).toBe('ミーティング準備')
      })

      it('説明文で検索できる', () => {
        const results = FuseSearch.search(
          testItems,
          '資料',
          [
            { name: 'title', weight: 1 },
            { name: 'description', weight: 1 },
          ],
          10
        )

        expect(results.length).toBeGreaterThan(0)
        expect(results[0]?.item.description).toBe('資料作成')
      })

      it('ファジー検索で部分一致する', () => {
        const results = FuseSearch.search(
          testItems,
          'レビュ',
          [{ name: 'title', weight: 1 }],
          10
        )

        expect(results.length).toBeGreaterThan(0)
        expect(results[0]?.item.title).toBe('コードレビュー')
      })

      it('limitで結果数を制限できる', () => {
        const results = FuseSearch.search(
          testItems,
          '',
          [{ name: 'title', weight: 1 }],
          2
        )

        expect(results).toHaveLength(2)
      })

      it('スコアが含まれる', () => {
        const results = FuseSearch.search(
          testItems,
          'ミーティング',
          [{ name: 'title', weight: 1 }],
          10
        )

        expect(results[0]?.score).toBeDefined()
        expect(typeof results[0]?.score).toBe('number')
      })

      it('マッチ情報が含まれる', () => {
        const results = FuseSearch.search(
          testItems,
          'ミーティング',
          [{ name: 'title', weight: 1 }],
          10
        )

        expect(results[0]?.matches).toBeDefined()
        expect(Array.isArray(results[0]?.matches)).toBe(true)
      })

      it('キャッシュキーを使用してインスタンスを再利用できる', () => {
        // 最初の検索
        const results1 = FuseSearch.search(
          testItems,
          'ミーティング',
          [{ name: 'title', weight: 1 }],
          10,
          'test-cache'
        )

        // 2回目の検索（キャッシュされたインスタンスを使用）
        const results2 = FuseSearch.search(
          testItems,
          'コード',
          [{ name: 'title', weight: 1 }],
          10,
          'test-cache'
        )

        expect(results1.length).toBeGreaterThan(0)
        expect(results2.length).toBeGreaterThan(0)
      })
    })

    describe('normalizeScore', () => {
      it('Fuseスコア0は正規化スコア1を返す', () => {
        expect(FuseSearch.normalizeScore(0)).toBe(1)
      })

      it('Fuseスコア1は正規化スコア0を返す', () => {
        expect(FuseSearch.normalizeScore(1)).toBe(0)
      })

      it('Fuseスコア0.5は正規化スコア0.5を返す', () => {
        expect(FuseSearch.normalizeScore(0.5)).toBe(0.5)
      })

      it('undefinedは正規化スコア1を返す', () => {
        expect(FuseSearch.normalizeScore(undefined)).toBe(1)
      })
    })

    describe('clearCache', () => {
      it('キャッシュをクリアできる', () => {
        const testItems = [{ id: '1', title: 'テスト' }]

        // キャッシュを作成
        FuseSearch.search(
          testItems,
          'テスト',
          [{ name: 'title', weight: 1 }],
          10,
          'test-cache'
        )

        // キャッシュをクリア
        FuseSearch.clearCache()

        // エラーなく再検索できることを確認
        const results = FuseSearch.search(
          testItems,
          'テスト',
          [{ name: 'title', weight: 1 }],
          10,
          'test-cache'
        )

        expect(results.length).toBeGreaterThan(0)
      })
    })
  })

  describe('FuzzySearch', () => {
    describe('search', () => {
      const testItems = [
        { title: 'ミーティング準備', description: '資料作成', keywords: '会議' },
        { title: 'コードレビュー', description: 'PRの確認', keywords: 'review' },
        { title: 'ドキュメント作成', description: '仕様書を書く', keywords: 'docs' },
      ]

      it('空のクエリですべてのアイテムを返す', () => {
        const results = FuzzySearch.search(testItems, '', 10)

        expect(results).toHaveLength(3)
      })

      it('タイトルで検索できる', () => {
        const results = FuzzySearch.search(testItems, 'ミーティング', 10)

        expect(results.length).toBeGreaterThan(0)
        expect(results[0]?.title).toBe('ミーティング準備')
      })

      it('limitで結果数を制限できる', () => {
        const results = FuzzySearch.search(testItems, '', 2)

        expect(results).toHaveLength(2)
      })

      it('結果は元のオブジェクト形式で返される', () => {
        const results = FuzzySearch.search(testItems, 'ミーティング', 10)

        expect(results[0]).toHaveProperty('title')
        expect(results[0]).toHaveProperty('description')
        expect(results[0]).toHaveProperty('keywords')
      })
    })
  })
})
