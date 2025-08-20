/**
 * Tailwind CSS プリセット設定
 * BoxLog テーマシステムとの統合
 */

import type { Config } from 'tailwindcss'
import {
  neutralColors,
  semanticColors, 
  brandColors,
  spacing,
  fontSize,
  fontWeight,
  boxShadow,
  darkBoxShadow,
  borderRadius,
  breakpoints,
  keyframes,
  calendarAnimations,
  duration,
  easing
} from './themes'

// メインのTailwindプリセット設定
export const boxlogPreset: Partial<Config> = {
  
  // 追加の設定
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // ダークモード設定
  darkMode: ['class', '[data-theme="dark"]'],

  theme: {
    extend: {
      // 基本カラーシステム
      colors: {
        ...neutralColors,
        ...Object.entries(semanticColors).reduce((acc, [key, colors]) => {
          acc[key] = colors
          return acc
        }, {} as Record<string, any>),
        ...Object.entries(brandColors).reduce((acc, [key, colors]) => {
          acc[key] = colors
          return acc
        }, {} as Record<string, any>),
        
        // CSS変数ベースの色定義（shadcn/ui互換）
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--background) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--muted) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
          foreground: 'rgb(var(--background) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
      },

      // スペーシング
      spacing: {
        ...spacing,
        'calendar-hour': 'var(--calendar-hour-height)',
        'calendar-time': 'var(--calendar-time-column-width)',
        'calendar-header': 'var(--calendar-header-height)',
        'calendar-sidebar': 'var(--calendar-sidebar-width)',
      },

      // カスタムフォントファミリー
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },

      // フォントサイズとウェイト
      fontSize,
      fontWeight,

      // ボーダー半径（extendではなく、デフォルトも含める）
      borderRadius: {
        'none': '0px',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem', 
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
        // カスタム設定
        ...borderRadius,
      },

      // ボックスシャドウ
      boxShadow: {
        ...boxShadow,
        'dark-xs': darkBoxShadow.xs,
        'dark-sm': darkBoxShadow.sm,
        'dark-md': darkBoxShadow.md,
        'dark-lg': darkBoxShadow.lg,
        'dark-xl': darkBoxShadow.xl,
        'dark-2xl': darkBoxShadow['2xl'],
      },

      // レスポンシブブレークポイント
      screens: breakpoints,

      // アニメーション設定
      keyframes: {
        ...keyframes,
        
        // カレンダー専用アニメーション
        'current-time-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'drag-preview-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 0 8px rgba(59, 130, 246, 0)' },
        },
        'slide-in-up': {
          'from': { 
            opacity: '0',
            transform: 'translateY(20px) scale(0.95)' 
          },
          'to': { 
            opacity: '1',
            transform: 'translateY(0) scale(1)' 
          },
        },
        'slide-in-down': {
          'from': { 
            opacity: '0',
            transform: 'translateY(-20px)' 
          },
          'to': { 
            opacity: '1',
            transform: 'translateY(0)' 
          },
        },
      },

      animation: {
        
        // カレンダー専用アニメーション
        'current-time-pulse': 'current-time-pulse 2s ease-in-out infinite',
        'drag-preview-pulse': 'drag-preview-pulse 1.5s ease-out infinite',
        'slide-in-up': 'slide-in-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-down': 'slide-in-down 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // カスタムグリッドテンプレート
      gridTemplateColumns: {
        'calendar-week': 'var(--calendar-time-column-width) repeat(7, 1fr)',
        'calendar-3day': 'var(--calendar-time-column-width) repeat(3, 1fr)',
        'calendar-day': 'var(--calendar-time-column-width) 1fr',
      },

      // カスタムZ-index
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },

      // カスタムトランジション
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'colors': 'color, background-color, border-color',
      },

      // カスタムタイミング関数
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },

  plugins: [
    // カスタムプラグイン: カレンダーユーティリティ
    function({ addUtilities, theme }) {
      const newUtilities = {
        // カレンダーグリッドユーティリティ
        '.calendar-grid': {
          display: 'grid',
          gridTemplateColumns: `var(--calendar-time-column-width) repeat(var(--calendar-days, 7), 1fr)`,
        },
        
        // イベントブロックのユーティリティ
        '.event-block': {
          position: 'absolute',
          borderRadius: theme('borderRadius.md'),
          padding: theme('spacing.2'),
          boxShadow: theme('boxShadow.sm'),
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        
        '.event-block:hover': {
          transform: 'scale(1.02)',
          boxShadow: theme('boxShadow.md'),
        },

        // 現在時刻線のユーティリティ
        '.current-time-line': {
          position: 'absolute',
          left: '0',
          right: '0',
          height: '2px',
          backgroundColor: 'rgb(var(--calendar-current-timeline))',
          zIndex: '10',
          
          '&::before': {
            content: '""',
            position: 'absolute',
            left: '0',
            top: '-3px',
            width: '8px',
            height: '8px',
            backgroundColor: 'rgb(var(--calendar-current-timeline))',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
          },
        },

        // グラスエフェクト
        '.glass': {
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgb(var(--background) / 0.8)',
          border: '1px solid rgb(var(--border) / 0.5)',
        },

        // カレンダータイムスロット
        '.time-slot': {
          height: 'var(--calendar-hour-height)',
          minHeight: 'var(--calendar-hour-height)',
          borderBottom: '1px solid rgb(var(--border) / 0.5)',
        },
      }

      addUtilities(newUtilities)
    },

    // カスタムコンポーネントプラグイン
    function({ addComponents, theme }) {
      const components = {
        // ボタンのベーススタイル
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme('borderRadius.md'),
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.medium'),
          transition: 'colors 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          
          '&:focus-visible': {
            outline: 'none',
            boxShadow: `0 0 0 2px rgb(var(--ring))`,
          },
          
          '&:disabled': {
            pointerEvents: 'none',
            opacity: '0.5',
          },
        },

        '.btn-primary': {
          backgroundColor: 'rgb(var(--primary))',
          color: 'rgb(var(--background))',
          
          '&:hover': {
            backgroundColor: 'rgb(var(--primary) / 0.9)',
          },
        },

        '.btn-secondary': {
          backgroundColor: 'rgb(var(--secondary))',
          color: 'rgb(var(--foreground))',
          border: '1px solid rgb(var(--border))',
          
          '&:hover': {
            backgroundColor: 'rgb(var(--secondary) / 0.8)',
          },
        },

        // カードコンポーネント
        '.card': {
          borderRadius: theme('borderRadius.lg'),
          border: '1px solid rgb(var(--border))',
          backgroundColor: 'rgb(var(--card))',
          color: 'rgb(var(--foreground))',
          boxShadow: theme('boxShadow.sm'),
        },
      }

      addComponents(components)
    },
  ],
}

// デフォルトエクスポート
export default boxlogPreset