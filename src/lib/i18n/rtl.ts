/**
 * RTL（右から左）言語サポート
 */

import type { Locale } from '@/types/i18n'

// RTL言語のリスト
export const RTL_LOCALES: Locale[] = [
  // 現在はサポートなし、将来追加予定
  // 'ar', // アラビア語
  // 'he', // ヘブライ語
  // 'fa', // ペルシャ語
  // 'ur', // ウルドゥー語
]

// 言語がRTLかどうかをチェック
export const isRTL = (locale: Locale): boolean => {
  return RTL_LOCALES.includes(locale)
}

// HTMLのdir属性を取得
export const getDirection = (locale: Locale): 'ltr' | 'rtl' => {
  return isRTL(locale) ? 'rtl' : 'ltr'
}

// RTL対応のテキスト配置クラス
export const getTextAlignment = (locale: Locale): string => {
  return isRTL(locale) ? 'text-right' : 'text-left'
}

// RTL対応のフレックスボックス方向
export const getFlexDirection = (locale: Locale): string => {
  return isRTL(locale) ? 'flex-row-reverse' : 'flex-row'
}

// RTL対応のマージンクラス
export const getMarginStart = (locale: Locale, value: string): string => {
  return isRTL(locale) ? `mr-${value}` : `ml-${value}`
}

export const getMarginEnd = (locale: Locale, value: string): string => {
  return isRTL(locale) ? `ml-${value}` : `mr-${value}`
}

// RTL対応のパディングクラス
export const getPaddingStart = (locale: Locale, value: string): string => {
  return isRTL(locale) ? `pr-${value}` : `pl-${value}`
}

export const getPaddingEnd = (locale: Locale, value: string): string => {
  return isRTL(locale) ? `pl-${value}` : `pr-${value}`
}

// RTL対応の位置クラス
export const getPositionStart = (locale: Locale, value: string): string => {
  return isRTL(locale) ? `right-${value}` : `left-${value}`
}

export const getPositionEnd = (locale: Locale, value: string): string => {
  return isRTL(locale) ? `left-${value}` : `right-${value}`
}

// RTL対応のアイコン配置
export const getIconPlacement = (locale: Locale): 'left' | 'right' => {
  return isRTL(locale) ? 'right' : 'left'
}

// RTL対応のボーダークラス
export const getBorderStart = (locale: Locale, width = '2'): string => {
  return isRTL(locale) ? `border-r-${width}` : `border-l-${width}`
}

export const getBorderEnd = (locale: Locale, width = '2'): string => {
  return isRTL(locale) ? `border-l-${width}` : `border-r-${width}`
}

// RTL対応のラウンドクラス
export const getRoundedStart = (locale: Locale, size = 'md'): string => {
  return isRTL(locale) ? `rounded-r-${size}` : `rounded-l-${size}`
}

export const getRoundedEnd = (locale: Locale, size = 'md'): string => {
  return isRTL(locale) ? `rounded-l-${size}` : `rounded-r-${size}`
}

// RTL対応のトランスフォーム
export const getTransform = (locale: Locale, transform: string): string => {
  if (!isRTL(locale)) return transform

  // X軸のトランスフォームを反転
  if (transform.includes('translateX')) {
    return transform.replace(/translateX\(([^)]+)\)/, (match, value) => {
      const numValue = parseFloat(value)
      const unit = value.replace(numValue.toString(), '')
      return `translateX(${-numValue}${unit})`
    })
  }

  if (transform.includes('scaleX')) {
    return transform.replace(/scaleX\(([^)]+)\)/, (match, value) => {
      return `scaleX(${-parseFloat(value)})`
    })
  }

  return transform
}

// RTL対応のアニメーション方向
export const getAnimationDirection = (locale: Locale): 'normal' | 'reverse' => {
  return isRTL(locale) ? 'reverse' : 'normal'
}

// RTL対応のグリッドクラス
export const getGridDirection = (locale: Locale): string => {
  return isRTL(locale) ? 'grid-flow-col-dense' : 'grid-flow-col'
}

// RTLスタイルシート生成
export const generateRTLStyles = (): string => {
  return `
    /* RTL言語用のグローバルスタイル */
    [dir="rtl"] {
      direction: rtl;
      text-align: right;
    }

    /* RTL用のフォーム要素調整 */
    [dir="rtl"] input,
    [dir="rtl"] textarea,
    [dir="rtl"] select {
      text-align: right;
      direction: rtl;
    }

    /* RTL用のアイコン配置調整 */
    [dir="rtl"] .icon-left {
      margin-left: 0;
      margin-right: 0.5rem;
    }

    [dir="rtl"] .icon-right {
      margin-right: 0;
      margin-left: 0.5rem;
    }

    /* RTL用のボタン調整 */
    [dir="rtl"] .btn-icon-left svg {
      margin-left: 0;
      margin-right: 0.5rem;
    }

    [dir="rtl"] .btn-icon-right svg {
      margin-right: 0;
      margin-left: 0.5rem;
    }

    /* RTL用のドロップダウン調整 */
    [dir="rtl"] .dropdown-menu {
      left: auto;
      right: 0;
    }

    /* RTL用のモーダル調整 */
    [dir="rtl"] .modal-close {
      left: 1rem;
      right: auto;
    }

    /* RTL用のサイドバー調整 */
    [dir="rtl"] .sidebar-left {
      left: auto;
      right: 0;
      border-left: none;
      border-right: 1px solid var(--border-color);
    }

    [dir="rtl"] .sidebar-right {
      right: auto;
      left: 0;
      border-right: none;
      border-left: 1px solid var(--border-color);
    }

    /* RTL用のプログレスバー調整 */
    [dir="rtl"] .progress-bar {
      transform-origin: right;
    }

    /* RTL用のチェックボックス・ラジオボタン調整 */
    [dir="rtl"] input[type="checkbox"],
    [dir="rtl"] input[type="radio"] {
      margin-left: 0.5rem;
      margin-right: 0;
    }

    /* RTL用のリスト調整 */
    [dir="rtl"] ul,
    [dir="rtl"] ol {
      padding-left: 0;
      padding-right: 2rem;
    }

    /* RTL用のテーブル調整 */
    [dir="rtl"] table {
      text-align: right;
    }

    [dir="rtl"] th,
    [dir="rtl"] td {
      text-align: inherit;
    }

    /* RTL用のパンくずリスト調整 */
    [dir="rtl"] .breadcrumb-item::before {
      content: "\\";
      margin: 0 0.5rem;
      transform: scaleX(-1);
    }

    /* RTL用のツールチップ調整 */
    [dir="rtl"] .tooltip-left {
      left: auto;
      right: 100%;
    }

    [dir="rtl"] .tooltip-right {
      right: auto;
      left: 100%;
    }
  `
}

// RTL対応のヘルパー関数をまとめてエクスポート
export const rtlHelpers = {
  isRTL,
  getDirection,
  getTextAlignment,
  getFlexDirection,
  getMarginStart,
  getMarginEnd,
  getPaddingStart,
  getPaddingEnd,
  getPositionStart,
  getPositionEnd,
  getIconPlacement,
  getBorderStart,
  getBorderEnd,
  getRoundedStart,
  getRoundedEnd,
  getTransform,
  getAnimationDirection,
  getGridDirection,
  generateRTLStyles,
}

export default rtlHelpers
