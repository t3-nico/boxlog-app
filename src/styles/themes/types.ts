/**
 * テーマシステム用の型定義
 */

// 基本的な色の型
export interface ColorValue {
  rgb: string
  hex: string
  hsl?: string
}

// カラーパレットの型
export interface ColorPalette {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950?: string
}

// テーマモードの型
export type ThemeMode = 'light' | 'dark' | 'system'

// テーマコンテキストの型
export type ThemeContext = 
  | 'background'
  | 'foreground' 
  | 'card'
  | 'popover'
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'accent'
  | 'destructive'
  | 'border'
  | 'input'
  | 'ring'

// 意味的カラーの型
export type SemanticColor = 
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

// タスク状態の型
export type TaskStatus = 
  | 'todo'
  | 'inProgress'
  | 'completed'
  | 'cancelled'

// 優先度の型
export type Priority = 
  | 'low'
  | 'medium'
  | 'high'

// デバイスタイプの型
export type DeviceType = 
  | 'mobile'
  | 'tablet'
  | 'desktop'

// ブレークポイントの型
export type BreakpointKey = 
  | 'xs'
  | 'sm' 
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'

// アニメーションの型
export type AnimationType = 
  | 'none'
  | 'fade'
  | 'slide'
  | 'scale'
  | 'bounce'
  | 'shake'
  | 'spin'

// トランジションの型
export interface TransitionConfig {
  property: string
  duration: string
  timing: string
  delay?: string
}

// シャドウの型
export type ShadowSize = 
  | 'none'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'

// フォントサイズの型
export type FontSize = 
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'

// フォント太さの型
export type FontWeight = 
  | 'thin'
  | 'extraLight'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semiBold'
  | 'bold'
  | 'extraBold'
  | 'black'

// スペーシングの型
export type SpacingSize = 
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32

// 角丸の型
export type BorderRadius = 
  | 'none'
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | 'full'

// テーマ設定の型
export interface ThemeConfig {
  mode: ThemeMode
  colors: {
    light: Record<ThemeContext, string>
    dark: Record<ThemeContext, string>
  }
  spacing: Record<SpacingSize, string>
  typography: {
    fontFamily: Record<string, string[]>
    fontSize: Record<FontSize, [string, { lineHeight: string }]>
    fontWeight: Record<FontWeight, string>
  }
  shadows: Record<ShadowSize, string>
  borderRadius: Record<BorderRadius, string>
  breakpoints: Record<BreakpointKey, string>
  animations: Record<string, any>
}

// カレンダー専用の型
export interface CalendarThemeConfig {
  hourHeight: {
    mobile: string
    tablet: string
    desktop: string
  }
  timeColumn: {
    width: string
    background: string
    textColor: string
  }
  currentTimeLine: {
    color: string
    thickness: string
    dotSize: string
  }
  eventBlock: {
    borderRadius: string
    padding: string
    shadow: string
  }
  grid: {
    lineColor: string
    businessHoursColor: string
    weekendTextColor: string
  }
}

// コンポーネントテーマの型
export interface ComponentThemeConfig {
  button: {
    sizes: Record<string, {
      height: string
      padding: string
      fontSize: string
    }>
    variants: Record<string, {
      background: string
      color: string
      border?: string
      hover?: {
        background: string
        color: string
      }
    }>
  }
  card: {
    background: string
    border: string
    shadow: string
    borderRadius: string
    padding: string
  }
  input: {
    height: string
    padding: string
    background: string
    border: string
    borderRadius: string
    focus: {
      borderColor: string
      ring: string
    }
  }
}

// テーマプロバイダーのプロパティ型
export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeMode
  storageKey?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

// テーマコンテキストの型
export interface ThemeContextType {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  systemTheme: 'light' | 'dark'
  resolvedTheme: 'light' | 'dark'
  themes: string[]
}

// CSS変数の型
export interface CSSVariables {
  [key: `--${string}`]: string | number
}

// ユーティリティ関数の型
export interface ThemeUtils {
  // カラー関連
  getColor: (context: ThemeContext, mode?: ThemeMode) => string
  getSemanticColor: (type: SemanticColor, shade?: number) => string
  getRgbColor: (hex: string) => string
  getHslColor: (hex: string) => string
  
  // レスポンシブ関連
  getBreakpoint: (key: BreakpointKey) => string
  getMediaQuery: (key: BreakpointKey, type?: 'up' | 'down') => string
  
  // スペーシング関連
  getSpacing: (size: SpacingSize) => string
  
  // タイポグラフィ関連
  getFontSize: (size: FontSize) => [string, { lineHeight: string }]
  getFontWeight: (weight: FontWeight) => string
  
  // シャドウ関連
  getShadow: (size: ShadowSize, mode?: ThemeMode) => string
  
  // アニメーション関連
  getTransition: (type: string) => string
  getEasing: (type: string) => string
}

// フック用の型
export interface UseThemeReturn extends ThemeContextType {
  isDark: boolean
  isLight: boolean
  isSystem: boolean
}

// Tailwind設定の型（参考用）
export interface TailwindThemeExtension {
  colors: Record<string, any>
  spacing: Record<string, string>
  fontSize: Record<string, [string, { lineHeight: string }]>
  fontWeight: Record<string, string>
  boxShadow: Record<string, string>
  borderRadius: Record<string, string>
  screens: Record<string, string>
  animation: Record<string, string>
  keyframes: Record<string, Record<string, Record<string, string>>>
}

// エクスポートされるテーマオブジェクトの型
export interface Theme {
  config: ThemeConfig
  calendar: CalendarThemeConfig
  components: ComponentThemeConfig
  utils: ThemeUtils
}

// カスタムプロパティ生成の型
export interface CustomProperties {
  light: CSSVariables
  dark: CSSVariables
}