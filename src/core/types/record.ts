// Core Record type definitions
// 後方互換用: 新規コードは src/core/types/entry.ts の FulfillmentScore を使用

/**
 * 充実度スコア（3段階）
 * 1: 微妙
 * 2: 普通
 * 3: 良い
 *
 * @deprecated src/core/types/entry.ts の FulfillmentScore を使用
 */
export type FulfillmentScore = 1 | 2 | 3;
