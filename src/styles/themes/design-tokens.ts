/**
 * デザイントークンシステム - BoxLog統一仕様
 * Compass Neutralカラーシステム完全準拠
 * WCAG AA基準対応
 */

// ===== 原始トークン（Primitive Tokens） =====

/**
 * 基本カラーパレット - Compass Neutral
 * 全ての色はこのパレットから選択
 */
export const primitiveColors = {
  // Neutral カラーレンジ（グレースケール）
  neutral: {
    0: { hex: '#ffffff', rgb: '255 255 255' },
    50: { hex: '#fafafa', rgb: '250 250 250' },
    100: { hex: '#f5f5f5', rgb: '245 245 245' },
    200: { hex: '#e5e5e5', rgb: '229 229 229' },
    300: { hex: '#d4d4d4', rgb: '212 212 212' },
    400: { hex: '#a3a3a3', rgb: '163 163 163' },
    500: { hex: '#737373', rgb: '115 115 115' },
    600: { hex: '#525252', rgb: '82 82 82' },
    700: { hex: '#404040', rgb: '64 64 64' },
    800: { hex: '#262626', rgb: '38 38 38' },
    900: { hex: '#171717', rgb: '23 23 23' },
    950: { hex: '#0a0a0a', rgb: '10 10 10' },
    1000: { hex: '#000000', rgb: '0 0 0' },
  },
  
  // ブランドカラー - Blue系
  blue: {
    50: { hex: '#eff6ff', rgb: '239 246 255' },
    100: { hex: '#dbeafe', rgb: '219 234 254' },
    200: { hex: '#bfdbfe', rgb: '191 219 254' },
    300: { hex: '#93c5fd', rgb: '147 197 253' },
    400: { hex: '#60a5fa', rgb: '96 165 250' },  // ダークモード プライマリ
    500: { hex: '#3b82f6', rgb: '59 130 246' },  // ライトモード プライマリ
    600: { hex: '#2563eb', rgb: '37 99 235' },
    700: { hex: '#1d4ed8', rgb: '29 78 216' },
    800: { hex: '#1e40af', rgb: '30 64 175' },
    900: { hex: '#1e3a8a', rgb: '30 58 138' },
    950: { hex: '#172554', rgb: '23 37 84' },
  },
  
  // セマンティックカラー - Green（成功）
  green: {
    50: { hex: '#f0fdf4', rgb: '240 253 244' },
    100: { hex: '#dcfce7', rgb: '220 252 231' },
    200: { hex: '#bbf7d0', rgb: '187 247 208' },
    300: { hex: '#86efac', rgb: '134 239 172' },
    400: { hex: '#4ade80', rgb: '74 222 128' },
    500: { hex: '#22c55e', rgb: '34 197 94' },   // 成功カラー
    600: { hex: '#16a34a', rgb: '22 163 74' },
    700: { hex: '#15803d', rgb: '21 128 61' },
    800: { hex: '#166534', rgb: '22 101 52' },
    900: { hex: '#14532d', rgb: '20 83 45' },
    950: { hex: '#052e16', rgb: '5 46 22' },
  },
  
  // セマンティックカラー - Red（エラー）
  red: {
    50: { hex: '#fef2f2', rgb: '254 242 242' },
    100: { hex: '#fee2e2', rgb: '254 226 226' },
    200: { hex: '#fecaca', rgb: '254 202 202' },
    300: { hex: '#fca5a5', rgb: '252 165 165' },
    400: { hex: '#f87171', rgb: '248 113 113' },
    500: { hex: '#ef4444', rgb: '239 68 68' },   // エラーカラー
    600: { hex: '#dc2626', rgb: '220 38 38' },
    700: { hex: '#b91c1c', rgb: '185 28 28' },
    800: { hex: '#991b1b', rgb: '153 27 27' },
    900: { hex: '#7f1d1d', rgb: '127 29 29' },
    950: { hex: '#450a0a', rgb: '69 10 10' },
  },
  
  // セマンティックカラー - Yellow（警告）
  yellow: {
    50: { hex: '#fefce8', rgb: '254 252 232' },
    100: { hex: '#fef9c3', rgb: '254 249 195' },
    200: { hex: '#fef08a', rgb: '254 240 138' },
    300: { hex: '#fde047', rgb: '253 224 71' },
    400: { hex: '#facc15', rgb: '250 204 21' },
    500: { hex: '#eab308', rgb: '234 179 8' },   // 警告カラー
    600: { hex: '#ca8a04', rgb: '202 138 4' },
    700: { hex: '#a16207', rgb: '161 98 7' },
    800: { hex: '#854d0e', rgb: '133 77 14' },
    900: { hex: '#713f12', rgb: '113 63 18' },
    950: { hex: '#422006', rgb: '66 32 6' },
  },
  
  // アクセントカラー - Orange（アクション）
  orange: {
    50: { hex: '#fff7ed', rgb: '255 247 237' },
    100: { hex: '#ffedd5', rgb: '255 237 213' },
    200: { hex: '#fed7aa', rgb: '254 215 170' },
    300: { hex: '#fdba74', rgb: '253 186 116' },
    400: { hex: '#fb923c', rgb: '251 146 60' },  // ダークモード アクション
    500: { hex: '#f97316', rgb: '249 115 22' },
    600: { hex: '#ea580c', rgb: '234 88 12' },   // ライトモード アクション
    700: { hex: '#c2410c', rgb: '194 65 12' },
    800: { hex: '#9a3412', rgb: '154 52 18' },
    900: { hex: '#7c2d12', rgb: '124 45 18' },
    950: { hex: '#431407', rgb: '67 20 7' },
  },
} as const

/**
 * スペーシングトークン - 8pxグリッドシステム
 */
export const primitiveSpacing = {
  0: { value: '0px', rem: '0rem' },
  1: { value: '4px', rem: '0.25rem' },   // 4px
  2: { value: '8px', rem: '0.5rem' },    // 8px - 基本単位
  3: { value: '12px', rem: '0.75rem' },  // 12px
  4: { value: '16px', rem: '1rem' },     // 16px - 基本サイズ
  5: { value: '20px', rem: '1.25rem' },  // 20px
  6: { value: '24px', rem: '1.5rem' },   // 24px
  8: { value: '32px', rem: '2rem' },     // 32px
  10: { value: '40px', rem: '2.5rem' },  // 40px
  12: { value: '48px', rem: '3rem' },    // 48px
  16: { value: '64px', rem: '4rem' },    // 64px
  20: { value: '80px', rem: '5rem' },    // 80px
  24: { value: '96px', rem: '6rem' },    // 96px
  32: { value: '128px', rem: '8rem' },   // 128px
  40: { value: '160px', rem: '10rem' },  // 160px
  48: { value: '192px', rem: '12rem' },  // 192px
  56: { value: '224px', rem: '14rem' },  // 224px
  64: { value: '256px', rem: '16rem' },  // 256px
} as const

/**
 * タイポグラフィトークン
 */
export const primitiveTypography = {
  // フォントファミリー
  fontFamily: {
    sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'ui-monospace', 'Consolas', 'monospace'],
    display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  },
  
  // フォントサイズ（8pxグリッド準拠）
  fontSize: {
    xs: { size: '12px', rem: '0.75rem', lineHeight: '16px' },   // 12px
    sm: { size: '14px', rem: '0.875rem', lineHeight: '20px' },  // 14px
    base: { size: '16px', rem: '1rem', lineHeight: '24px' },    // 16px - 基本
    lg: { size: '18px', rem: '1.125rem', lineHeight: '28px' },  // 18px
    xl: { size: '20px', rem: '1.25rem', lineHeight: '28px' },   // 20px
    '2xl': { size: '24px', rem: '1.5rem', lineHeight: '32px' }, // 24px
    '3xl': { size: '30px', rem: '1.875rem', lineHeight: '36px' }, // 30px
    '4xl': { size: '36px', rem: '2.25rem', lineHeight: '40px' }, // 36px
    '5xl': { size: '48px', rem: '3rem', lineHeight: '48px' },   // 48px
    '6xl': { size: '60px', rem: '3.75rem', lineHeight: '60px' }, // 60px
  },
  
  // フォントウェイト
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  // 行間（Line Height）
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  
  // 文字間隔（Letter Spacing）
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const

/**
 * ボーダー半径トークン
 */
export const primitiveBorderRadius = {
  none: { value: '0px', rem: '0rem' },
  xs: { value: '2px', rem: '0.125rem' },   // 2px
  sm: { value: '4px', rem: '0.25rem' },    // 4px
  base: { value: '6px', rem: '0.375rem' }, // 6px - 基本
  md: { value: '8px', rem: '0.5rem' },     // 8px
  lg: { value: '12px', rem: '0.75rem' },   // 12px
  xl: { value: '16px', rem: '1rem' },      // 16px
  '2xl': { value: '24px', rem: '1.5rem' }, // 24px
  '3xl': { value: '32px', rem: '2rem' },   // 32px
  full: { value: '9999px', rem: '624.9375rem' }, // 完全な円
} as const

/**
 * シャドウトークン
 */
export const primitiveShadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  '2xl': '0 50px 100px -20px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const

/**
 * ダークモード用シャドウ
 */
export const primitiveShadowsDark = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
  base: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
  md: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
  lg: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.5)',
  '2xl': '0 50px 100px -20px rgb(0 0 0 / 0.5)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.2)',
} as const

/**
 * アニメーション・トランジショントークン
 */
export const primitiveTransitions = {
  // 持続時間
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
    slower: '600ms',
  },
  
  // イージング
  easing: {
    linear: 'linear',
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  },
} as const

/**
 * Z-indexトークン
 */
export const primitiveZIndex = {
  hide: -1,
  base: 0,
  raised: 1,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
  max: 9999,
} as const

/**
 * ブレークポイントトークン
 */
export const primitiveBreakpoints = {
  xs: { value: '475px', min: '475px' },    // モバイル（小）
  sm: { value: '640px', min: '640px' },    // モバイル（大）
  md: { value: '768px', min: '768px' },    // タブレット
  lg: { value: '1024px', min: '1024px' },  // デスクトップ（小）
  xl: { value: '1280px', min: '1280px' },  // デスクトップ（大）
  '2xl': { value: '1536px', min: '1536px' }, // デスクトップ（特大）
} as const

// ===== セマンティックトークン（Semantic Tokens） =====

/**
 * 背景色セマンティックトークン
 */
export const semanticBackground = {
  primary: {
    light: primitiveColors.neutral[0],    // 白
    dark: primitiveColors.neutral[950],   // 濃いグレー
  },
  secondary: {
    light: primitiveColors.neutral[50],   // 薄いグレー
    dark: primitiveColors.neutral[900],   // グレー
  },
  tertiary: {
    light: primitiveColors.neutral[100],  // さらに薄いグレー
    dark: primitiveColors.neutral[800],   // ミディアムグレー
  },
  card: {
    light: primitiveColors.neutral[0],    // 白
    dark: primitiveColors.neutral[900],   // グレー
  },
  overlay: {
    light: { hex: '#ffffff', rgb: '255 255 255' }, // 半透明白
    dark: { hex: '#000000', rgb: '0 0 0' },        // 半透明黒
  },
  elevated: {
    light: primitiveColors.neutral[0],    // 白（カード等）
    dark: primitiveColors.neutral[800],   // ライトグレー
  },
} as const

/**
 * テキスト色セマンティックトークン
 */
export const semanticText = {
  primary: {
    light: primitiveColors.neutral[900],  // 濃いグレー
    dark: primitiveColors.neutral[50],    // 薄いグレー
  },
  secondary: {
    light: primitiveColors.neutral[600],  // ミディアムグレー
    dark: primitiveColors.neutral[400],   // ライトグレー
  },
  tertiary: {
    light: primitiveColors.neutral[500],  // グレー
    dark: primitiveColors.neutral[500],   // グレー
  },
  muted: {
    light: primitiveColors.neutral[400],  // 薄いグレー
    dark: primitiveColors.neutral[600],   // ダークグレー
  },
  disabled: {
    light: primitiveColors.neutral[300],  // 無効状態
    dark: primitiveColors.neutral[700],   // 無効状態
  },
  placeholder: {
    light: primitiveColors.neutral[400],  // プレースホルダー
    dark: primitiveColors.neutral[500],   // プレースホルダー
  },
} as const

/**
 * ボーダー色セマンティックトークン
 */
export const semanticBorder = {
  primary: {
    light: primitiveColors.neutral[200],  // ライトボーダー
    dark: primitiveColors.neutral[700],   // ダークボーダー
  },
  secondary: {
    light: primitiveColors.neutral[300],  // ミディアムボーダー
    dark: primitiveColors.neutral[600],   // ミディアムボーダー
  },
  subtle: {
    light: primitiveColors.neutral[100],  // 薄いボーダー
    dark: primitiveColors.neutral[800],   // 薄いボーダー
  },
  strong: {
    light: primitiveColors.neutral[400],  // 強いボーダー
    dark: primitiveColors.neutral[500],   // 強いボーダー
  },
} as const

/**
 * インタラクション色セマンティックトークン
 */
export const semanticInteraction = {
  // プライマリブランドカラー
  primary: {
    default: {
      light: primitiveColors.blue[500],   // 標準青
      dark: primitiveColors.blue[400],    // ライト青
    },
    hover: {
      light: primitiveColors.blue[600],   // ホバー時
      dark: primitiveColors.blue[300],    // ホバー時
    },
    active: {
      light: primitiveColors.blue[700],   // アクティブ時
      dark: primitiveColors.blue[200],    // アクティブ時
    },
    disabled: {
      light: primitiveColors.neutral[300], // 無効時
      dark: primitiveColors.neutral[700],  // 無効時
    },
  },
  
  // セカンダリアクション
  secondary: {
    default: {
      light: primitiveColors.neutral[100], // 薄いグレー
      dark: primitiveColors.neutral[800],  // ダークグレー
    },
    hover: {
      light: primitiveColors.neutral[200], // ホバー時
      dark: primitiveColors.neutral[700],  // ホバー時
    },
    active: {
      light: primitiveColors.neutral[300], // アクティブ時
      dark: primitiveColors.neutral[600],  // アクティブ時
    },
  },
  
  // アクセントカラー（Orange）
  accent: {
    default: {
      light: primitiveColors.orange[600],  // オレンジ
      dark: primitiveColors.orange[400],   // ライトオレンジ
    },
    hover: {
      light: primitiveColors.orange[700],  // ホバー時
      dark: primitiveColors.orange[300],   // ホバー時
    },
    active: {
      light: primitiveColors.orange[800],  // アクティブ時
      dark: primitiveColors.orange[200],   // アクティブ時
    },
  },
} as const

/**
 * 状態色セマンティックトークン
 */
export const semanticState = {
  // 成功状態
  success: {
    background: {
      light: primitiveColors.green[50],   // 薄い緑背景
      dark: primitiveColors.green[950],   // 濃い緑背景
    },
    border: {
      light: primitiveColors.green[200],  // 緑ボーダー
      dark: primitiveColors.green[800],   // 濃い緑ボーダー
    },
    text: {
      light: primitiveColors.green[700],  // 緑テキスト
      dark: primitiveColors.green[300],   // ライト緑テキスト
    },
    icon: {
      light: primitiveColors.green[500],  // 緑アイコン
      dark: primitiveColors.green[400],   // ライト緑アイコン
    },
  },
  
  // エラー状態
  error: {
    background: {
      light: primitiveColors.red[50],     // 薄い赤背景
      dark: primitiveColors.red[950],     // 濃い赤背景
    },
    border: {
      light: primitiveColors.red[200],    // 赤ボーダー
      dark: primitiveColors.red[800],     // 濃い赤ボーダー
    },
    text: {
      light: primitiveColors.red[700],    // 赤テキスト
      dark: primitiveColors.red[300],     // ライト赤テキスト
    },
    icon: {
      light: primitiveColors.red[500],    // 赤アイコン
      dark: primitiveColors.red[400],     // ライト赤アイコン
    },
  },
  
  // 警告状態
  warning: {
    background: {
      light: primitiveColors.yellow[50],  // 薄い黄背景
      dark: primitiveColors.yellow[950],  // 濃い黄背景
    },
    border: {
      light: primitiveColors.yellow[200], // 黄ボーダー
      dark: primitiveColors.yellow[800],  // 濃い黄ボーダー
    },
    text: {
      light: primitiveColors.yellow[700], // 黄テキスト
      dark: primitiveColors.yellow[300],  // ライト黄テキスト
    },
    icon: {
      light: primitiveColors.yellow[500], // 黄アイコン
      dark: primitiveColors.yellow[400],  // ライト黄アイコン
    },
  },
  
  // 情報状態
  info: {
    background: {
      light: primitiveColors.blue[50],    // 薄い青背景
      dark: primitiveColors.blue[950],    // 濃い青背景
    },
    border: {
      light: primitiveColors.blue[200],   // 青ボーダー
      dark: primitiveColors.blue[800],    // 濃い青ボーダー
    },
    text: {
      light: primitiveColors.blue[700],   // 青テキスト
      dark: primitiveColors.blue[300],    // ライト青テキスト
    },
    icon: {
      light: primitiveColors.blue[500],   // 青アイコン
      dark: primitiveColors.blue[400],    // ライト青アイコン
    },
  },
} as const

/**
 * フィードバック色セマンティックトークン
 */
export const semanticFeedback = {
  focus: {
    ring: {
      light: primitiveColors.blue[500],   // フォーカスリング
      dark: primitiveColors.blue[400],    // フォーカスリング
    },
    outline: {
      light: primitiveColors.blue[200],   // フォーカスアウトライン
      dark: primitiveColors.blue[700],    // フォーカスアウトライン
    },
  },
  selection: {
    background: {
      light: primitiveColors.blue[100],   // 選択背景
      dark: primitiveColors.blue[900],    // 選択背景
    },
    text: {
      light: primitiveColors.blue[900],   // 選択テキスト
      dark: primitiveColors.blue[100],    // 選択テキスト
    },
  },
} as const

// ===== ユーティリティ関数 =====

/**
 * HEXカラーをRGBに変換
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * RGB文字列をRGBオブジェクトに変換
 */
const rgbStringToRgb = (rgbString: string): { r: number; g: number; b: number } | null => {
  const values = rgbString.split(' ').map(v => parseInt(v.trim(), 10))
  if (values.length === 3 && values.every(v => !isNaN(v))) {
    return { r: values[0], g: values[1], b: values[2] }
  }
  return null
}

/**
 * 相対輝度を計算
 */
const getRelativeLuminance = (color: { r: number; g: number; b: number }): number => {
  const { r, g, b } = color
  
  // sRGB色空間での輝度計算
  const getRsRGB = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  
  const rLinear = getRsRGB(r)
  const gLinear = getRsRGB(g)
  const bLinear = getRsRGB(b)
  
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

/**
 * カラーコントラスト比計算（WCAG 2.1準拠）
 */
export const calculateContrast = (color1: string, color2: string): number => {
  // 色の形式を判定してRGBに変換
  let rgb1: { r: number; g: number; b: number } | null = null
  let rgb2: { r: number; g: number; b: number } | null = null
  
  // HEX形式の場合
  if (color1.startsWith('#')) {
    rgb1 = hexToRgb(color1)
  }
  // RGB文字列の場合（例: "255 255 255"）
  else if (/^\d+\s+\d+\s+\d+$/.test(color1)) {
    rgb1 = rgbStringToRgb(color1)
  }
  
  if (color2.startsWith('#')) {
    rgb2 = hexToRgb(color2)
  }
  else if (/^\d+\s+\d+\s+\d+$/.test(color2)) {
    rgb2 = rgbStringToRgb(color2)
  }
  
  if (!rgb1 || !rgb2) {
    console.warn('Invalid color format for contrast calculation:', { color1, color2 })
    return 1
  }
  
  // 相対輝度を計算
  const luminance1 = getRelativeLuminance(rgb1)
  const luminance2 = getRelativeLuminance(rgb2)
  
  // コントラスト比を計算（より明るい色を分子に）
  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * アクセシビリティチェック（WCAG 2.1 AA/AAA基準）
 */
export const checkAccessibility = (foreground: string, background: string) => {
  const contrast = calculateContrast(foreground, background)
  
  return {
    contrast: Math.round(contrast * 100) / 100, // 小数点2桁まで
    passAA: contrast >= 4.5,
    passAAA: contrast >= 7,
    passAALarge: contrast >= 3, // 大きなテキスト（18pt以上または14pt bold以上）
    level: contrast >= 7 ? 'AAA' : contrast >= 4.5 ? 'AA' : contrast >= 3 ? 'AA Large' : 'Fail',
    recommendation: contrast >= 7 
      ? 'Excellent accessibility' 
      : contrast >= 4.5 
      ? 'Good accessibility for normal text' 
      : contrast >= 3 
      ? 'Acceptable for large text only' 
      : 'Insufficient contrast - please adjust colors',
  }
}

/**
 * デザイントークンのアクセシビリティ検証
 */
export const validateTokenAccessibility = () => {
  const results: Array<{
    name: string
    foreground: string
    background: string
    result: ReturnType<typeof checkAccessibility>
  }> = []
  
  // ライトモードの主要な組み合わせをテスト
  const lightTests = [
    {
      name: 'Light Mode - Primary Text on Background',
      foreground: semanticText.primary.light.hex,
      background: semanticBackground.primary.light.hex,
    },
    {
      name: 'Light Mode - Secondary Text on Background',
      foreground: semanticText.secondary.light.hex,
      background: semanticBackground.primary.light.hex,
    },
    {
      name: 'Light Mode - Primary Button',
      foreground: semanticBackground.primary.light.hex,
      background: semanticInteraction.primary.default.light.hex,
    },
    {
      name: 'Light Mode - Error Text on Error Background',
      foreground: semanticState.error.text.light.hex,
      background: semanticState.error.background.light.hex,
    },
  ]
  
  // ダークモードの主要な組み合わせをテスト
  const darkTests = [
    {
      name: 'Dark Mode - Primary Text on Background',
      foreground: semanticText.primary.dark.hex,
      background: semanticBackground.primary.dark.hex,
    },
    {
      name: 'Dark Mode - Secondary Text on Background',
      foreground: semanticText.secondary.dark.hex,
      background: semanticBackground.primary.dark.hex,
    },
    {
      name: 'Dark Mode - Primary Button',
      foreground: semanticBackground.primary.dark.hex,
      background: semanticInteraction.primary.default.dark.hex,
    },
    {
      name: 'Dark Mode - Error Text on Error Background',
      foreground: semanticState.error.text.dark.hex,
      background: semanticState.error.background.dark.hex,
    },
  ]
  
  // すべてのテストを実行
  const allTests = lightTests.concat(darkTests)
  allTests.forEach(test => {
    results.push({
      name: test.name,
      foreground: test.foreground,
      background: test.background,
      result: checkAccessibility(test.foreground, test.background)
    })
  })
  
  return results
}

/**
 * アクセシビリティレポートを生成
 */
export const generateAccessibilityReport = () => {
  const results = validateTokenAccessibility()
  
  const report = {
    totalTests: results.length,
    passedAA: results.filter(r => r.result.passAA).length,
    passedAAA: results.filter(r => r.result.passAAA).length,
    failed: results.filter(r => !r.result.passAA).length,
    details: results,
    summary: {
      aaCompliance: `${results.filter(r => r.result.passAA).length}/${results.length} combinations pass AA`,
      aaaCompliance: `${results.filter(r => r.result.passAAA).length}/${results.length} combinations pass AAA`,
      worstContrast: Math.min(...results.map(r => r.result.contrast)),
      bestContrast: Math.max(...results.map(r => r.result.contrast)),
    }
  }
  
  return report
}