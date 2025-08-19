/**
 * 基本カラーパレット - Compass Neutralカラーシステム準拠
 */

// Neutralカラーパレット（メインカラー）
export const neutralColors = {
  0: '#ffffff',
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0a0a0a',
  1000: '#000000',
} as const

// RGB形式での値（CSS変数用）
export const neutralColorsRGB = {
  0: '255 255 255',
  50: '250 250 250',
  100: '245 245 245',
  200: '229 229 229',
  300: '212 212 212',
  400: '163 163 163',
  500: '115 115 115',
  600: '82 82 82',
  700: '64 64 64',
  800: '38 38 38',
  900: '23 23 23',
  950: '10 10 10',
  1000: '0 0 0',
} as const

// テーマ別カラーマッピング
export const lightModeColors = {
  // 背景色
  bgPrimary: neutralColorsRGB[0],      // white - メイン背景
  bgSecondary: neutralColorsRGB[50],   // サイドバー背景
  bgCard: neutralColorsRGB[100],       // カード背景
  
  // テキスト色
  textPrimary: neutralColorsRGB[900],   // メインテキスト
  textSecondary: neutralColorsRGB[600], // セカンダリテキスト
  textMuted: neutralColorsRGB[400],     // 薄いテキスト
  
  // アイコン色
  iconPrimary: neutralColorsRGB[500],   // 通常アイコン
  iconSecondary: neutralColorsRGB[400], // セカンダリアイコン
  
  // ボーダー色
  borderPrimary: neutralColorsRGB[200],   // メインボーダー
  borderSecondary: neutralColorsRGB[300], // セカンダリボーダー
  
  // ホバー効果
  hoverBg: neutralColorsRGB[200],       // ホバー背景
  hoverText: neutralColorsRGB[900],     // ホバーテキスト
  hoverIcon: neutralColorsRGB[900],     // ホバーアイコン
} as const

export const darkModeColors = {
  // 背景色
  bgPrimary: neutralColorsRGB[950],     // メイン背景
  bgSecondary: neutralColorsRGB[900],   // サイドバー背景
  bgCard: neutralColorsRGB[800],        // カード背景
  
  // テキスト色
  textPrimary: neutralColorsRGB[50],    // メインテキスト
  textSecondary: neutralColorsRGB[300], // セカンダリテキスト
  textMuted: neutralColorsRGB[500],     // 薄いテキスト
  
  // ボーダー色
  borderPrimary: neutralColorsRGB[700],   // メインボーダー
  borderSecondary: neutralColorsRGB[600], // セカンダリボーダー
  
  // ホバー効果
  hoverBg: neutralColorsRGB[700],       // ホバー背景
  hoverText: neutralColorsRGB[50],      // ホバーテキスト
  hoverIcon: neutralColorsRGB[50],      // ホバーアイコン
} as const

// ブランドカラー（アクセント用）
export const brandColors = {
  // 現在使用しているプライマリカラー（青）
  primary: {
    light: '96 165 250',  // blue-400 (ダークモード用)
    default: '59 130 246', // blue-500 (ライトモード用)
    dark: '30 64 175',     // blue-800
  },
  
  // Addボタン用オレンジ
  orange: {
    light: '251 146 60',  // orange-400 (ダークモード用)
    default: '234 88 12', // orange-600 (ライトモード用)
    dark: '194 65 12',    // orange-700
  },
} as const

// 色の型定義
export type NeutralColorKey = keyof typeof neutralColors
export type ColorTheme = 'light' | 'dark'
export type ColorContext = 'bg' | 'text' | 'border' | 'icon' | 'hover'