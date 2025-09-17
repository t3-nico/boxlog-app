'use client'

import { useState, useEffect, useCallback } from 'react'

interface HighContrastColors {
  background: string
  foreground: string
  primary: string
  secondary: string
  accent: string
  border: string
  focus: string
  selected: string
  disabled: string
  error: string
  warning: string
  success: string
}

interface ContrastTheme {
  name: string
  colors: HighContrastColors
  wcagAAA: boolean
}

// WCAG AAA準拠のハイコントラストカラーテーマ
const HIGH_CONTRAST_THEMES: Record<string, ContrastTheme> = {
  default: {
    name: '標準コントラスト',
    wcagAAA: false,
    colors: {
      background: '#ffffff',
      foreground: '#000000',
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#3b82f6',
      border: '#d1d5db',
      focus: '#2563eb',
      selected: '#dbeafe',
      disabled: '#9ca3af',
      error: '#dc2626',
      warning: '#d97706',
      success: '#059669'
    }
  },
  blackOnWhite: {
    name: '黒地に白文字（ハイコントラスト）',
    wcagAAA: true,
    colors: {
      background: '#000000',
      foreground: '#ffffff',
      primary: '#ffffff',
      secondary: '#cccccc',
      accent: '#00ff00',
      border: '#ffffff',
      focus: '#ffff00',
      selected: '#0066cc',
      disabled: '#666666',
      error: '#ff0000',
      warning: '#ffaa00',
      success: '#00ff00'
    }
  },
  whiteOnBlack: {
    name: '白地に黒文字（ハイコントラスト）',
    wcagAAA: true,
    colors: {
      background: '#ffffff',
      foreground: '#000000',
      primary: '#000000',
      secondary: '#333333',
      accent: '#0000ff',
      border: '#000000',
      focus: '#ff0000',
      selected: '#ffff00',
      disabled: '#999999',
      error: '#cc0000',
      warning: '#cc6600',
      success: '#006600'
    }
  },
  yellowOnBlack: {
    name: '黒地に黄色文字（ハイコントラスト）',
    wcagAAA: true,
    colors: {
      background: '#000000',
      foreground: '#ffff00',
      primary: '#ffff00',
      secondary: '#cccc00',
      accent: '#00ffff',
      border: '#ffff00',
      focus: '#ff0000',
      selected: '#333300',
      disabled: '#666600',
      error: '#ff0000',
      warning: '#ff6600',
      success: '#00ff00'
    }
  },
  blueOnYellow: {
    name: '黄色地に青文字（ハイコントラスト）',
    wcagAAA: true,
    colors: {
      background: '#ffff00',
      foreground: '#000080',
      primary: '#000080',
      secondary: '#000060',
      accent: '#8000ff',
      border: '#000080',
      focus: '#ff0000',
      selected: '#ccccff',
      disabled: '#666666',
      error: '#cc0000',
      warning: '#cc3300',
      success: '#006600'
    }
  }
}

// OSの設定からハイコントラストモードを検出
function detectSystemHighContrast(): boolean {
  if (typeof window === 'undefined') return false
  
  return window.matchMedia('(prefers-contrast: high)').matches ||
         window.matchMedia('(-ms-high-contrast: active)').matches ||
         window.matchMedia('(-ms-high-contrast: black-on-white)').matches ||
         window.matchMedia('(-ms-high-contrast: white-on-black)').matches
}

// 色のコントラスト比を計算（WCAG準拠）
function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const rgb = color.startsWith('#') ? 
      parseInt(color.slice(1), 16) : 0
    
    const r = (rgb >> 16) & 255
    const g = (rgb >> 8) & 255
    const b = rgb & 255
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }
  
  const lum1 = getLuminance(color1)
  const lum2 = getLuminance(color2)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

// ハイコントラストスタイルを削除
function removeHighContrastStyles(): void {
  document.documentElement.removeAttribute('data-high-contrast')
  Object.keys(HIGH_CONTRAST_THEMES.default.colors).forEach(key => {
    document.documentElement.style.removeProperty(`--contrast-${key}`)
  })
  
  const existingStyle = document.getElementById('high-contrast-styles')
  if (existingStyle) {
    existingStyle.remove()
  }
}

// 基本スタイルを生成
function generateBaseStyles(isDark: boolean): string {
  return `
    [data-high-contrast="${isDark ? 'dark' : 'light'}"] {
      background-color: ${isDark ? '#000000' : '#ffffff'} !important;
      color: ${isDark ? '#ffffff' : '#000000'} !important;
    }
    
    [data-high-contrast] .contrast-bg {
      background-color: ${isDark ? '#000000' : '#ffffff'} !important;
    }
    
    [data-high-contrast] .contrast-text {
      color: ${isDark ? '#ffffff' : '#000000'} !important;
    }
    
    [data-high-contrast] .contrast-border {
      border-color: ${isDark ? '#ffffff' : '#000000'} !important;
    }
  `
}

// フォーカススタイルを生成
function generateFocusStyles(isDark: boolean): string {
  const focusColor = isDark ? '#ffffff' : '#000000'
  return `
    [data-high-contrast] .contrast-focus {
      outline-color: ${focusColor} !important;
      box-shadow: 0 0 0 2px ${focusColor} !important;
    }
    
    [data-high-contrast] *:focus {
      outline: 3px solid ${focusColor} !important;
      outline-offset: 2px !important;
    }
  `
}

// インタラクティブ要素スタイルを生成
function generateInteractiveStyles(isDark: boolean): string {
  const primary = isDark ? '#ffffff' : '#000000'
  const secondary = isDark ? '#000000' : '#ffffff'
  const hover = isDark ? '#333333' : '#cccccc'
  
  return `
    [data-high-contrast] button,
    [data-high-contrast] [role="button"] {
      border: 2px solid ${primary} !important;
      background-color: ${secondary} !important;
      color: ${primary} !important;
    }
    
    [data-high-contrast] button:hover,
    [data-high-contrast] [role="button"]:hover {
      background-color: ${hover} !important;
    }
    
    [data-high-contrast] a {
      color: ${isDark ? '#00aaff' : '#0066cc'} !important;
      text-decoration: underline !important;
    }
    
    [data-high-contrast] input,
    [data-high-contrast] textarea,
    [data-high-contrast] select {
      border: 2px solid ${primary} !important;
      background-color: ${secondary} !important;
      color: ${primary} !important;
    }
  `
}

// 選択状態スタイルを生成
function generateSelectionStyles(isDark: boolean): string {
  return `
    [data-high-contrast] .contrast-selected {
      background-color: ${isDark ? '#333333' : '#cccccc'} !important;
    }
    
    [data-high-contrast] .contrast-primary {
      color: ${isDark ? '#ffffff' : '#000000'} !important;
    }
    
    [data-high-contrast] .contrast-warning {
      color: #ff6600 !important;
    }
    
    [data-high-contrast] .contrast-success {
      color: #00aa00 !important;
    }
    
    [data-high-contrast] [aria-selected="true"],
    [data-high-contrast] .selected {
      background-color: ${isDark ? '#333333' : '#cccccc'} !important;
      border: 2px solid ${isDark ? '#ffffff' : '#000000'} !important;
    }
  `
}

// ハイコントラストテーマを適用
function applyHighContrastTheme(themeName: string): void {
  document.documentElement.setAttribute('data-high-contrast', themeName)
  
  const isDark = themeName === 'dark' || themeName === 'blackOnWhite' || themeName === 'yellowOnBlack'
  
  const styleContent = [
    generateBaseStyles(isDark),
    generateFocusStyles(isDark),
    generateInteractiveStyles(isDark),
    generateSelectionStyles(isDark)
  ].join('')
  
  const existingStyle = document.getElementById('high-contrast-styles')
  if (existingStyle) {
    existingStyle.remove()
  }
  
  const style = document.createElement('style')
  style.id = 'high-contrast-styles'
  style.textContent = styleContent
  document.head.appendChild(style)
}

export function useHighContrast() {
  const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<string>('default')
  const [isSystemHighContrast, setIsSystemHighContrast] = useState(false)

  // システムのハイコントラスト設定を監視
  useEffect(() => {
    const updateSystemHighContrast = () => {
      const systemHighContrast = detectSystemHighContrast()
      setIsSystemHighContrast(systemHighContrast)
      
      // システムでハイコントラストが有効な場合、自動的に適用
      if (systemHighContrast && !isHighContrastEnabled) {
        setIsHighContrastEnabled(true)
        setCurrentTheme('blackOnWhite')
      }
    }

    updateSystemHighContrast()

    // メディアクエリの変更を監視
    const mediaQueries = [
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(-ms-high-contrast: active)'),
      window.matchMedia('(-ms-high-contrast: black-on-white)'),
      window.matchMedia('(-ms-high-contrast: white-on-black)')
    ]

    mediaQueries.forEach(mq => {
      mq.addEventListener('change', updateSystemHighContrast)
    })

    return () => {
      mediaQueries.forEach(mq => {
        mq.removeEventListener('change', updateSystemHighContrast)
      })
    }
  }, [isHighContrastEnabled])

  // ローカルストレージから設定を復元
  useEffect(() => {
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast')
    const savedTheme = localStorage.getItem('accessibility-contrast-theme')
    
    if (savedHighContrast === 'true') {
      setIsHighContrastEnabled(true)
    }
    
    if (savedTheme && HIGH_CONTRAST_THEMES[savedTheme]) {
      setCurrentTheme(savedTheme)
    }
  }, [])

  // テーマの適用
  useEffect(() => {
    const theme = HIGH_CONTRAST_THEMES[currentTheme]
    if (!theme || !isHighContrastEnabled) {
      removeHighContrastStyles()
      return
    }

    applyHighContrastTheme(currentTheme)
  }, [isHighContrastEnabled, currentTheme])

  // ハイコントラストモードの切り替え
  const toggleHighContrast = useCallback((enabled?: boolean) => {
    const newEnabled = enabled !== undefined ? enabled : !isHighContrastEnabled
    setIsHighContrastEnabled(newEnabled)
    localStorage.setItem('accessibility-high-contrast', newEnabled.toString())
    
    // システムからの自動適用でない場合は、適切なテーマを選択
    if (newEnabled && currentTheme === 'default') {
      setCurrentTheme('blackOnWhite')
    }
  }, [isHighContrastEnabled, currentTheme])

  // テーマの変更
  const changeTheme = useCallback((themeName: string) => {
    if (HIGH_CONTRAST_THEMES[themeName]) {
      setCurrentTheme(themeName)
      localStorage.setItem('accessibility-contrast-theme', themeName)
      
      // テーマ変更時にハイコントラストモードも有効化
      if (!isHighContrastEnabled) {
        setIsHighContrastEnabled(true)
        localStorage.setItem('accessibility-high-contrast', 'true')
      }
    }
  }, [isHighContrastEnabled])

  // 現在のテーマの情報を取得
  const getCurrentTheme = useCallback(() => {
    return HIGH_CONTRAST_THEMES[currentTheme]
  }, [currentTheme])

  // 利用可能なテーマリストを取得
  const getAvailableThemes = useCallback(() => {
    return Object.entries(HIGH_CONTRAST_THEMES).map(([key, theme]) => ({
      key,
      ...theme
    }))
  }, [])

  // 特定の色の組み合わせのコントラスト比を確認
  const checkContrast = useCallback((foreground: string, background: string) => {
    const ratio = calculateContrastRatio(foreground, background)
    return {
      ratio,
      wcagAA: ratio >= 4.5,
      wcagAAA: ratio >= 7.0
    }
  }, [])

  // 現在のテーマのコントラスト比を検証
  const validateCurrentTheme = useCallback(() => {
    const theme = getCurrentTheme()
    const results = {
      background_foreground: checkContrast(theme.colors.foreground, theme.colors.background),
      primary_background: checkContrast(theme.colors.primary, theme.colors.background),
      accent_background: checkContrast(theme.colors.accent, theme.colors.background),
      error_background: checkContrast(theme.colors.error, theme.colors.background),
      warning_background: checkContrast(theme.colors.warning, theme.colors.background),
      success_background: checkContrast(theme.colors.success, theme.colors.background)
    }
    
    const allAAA = Object.values(results).every(result => result.wcagAAA)
    const allAA = Object.values(results).every(result => result.wcagAA)
    
    return {
      results,
      wcagAAA: allAAA,
      wcagAA: allAA
    }
  }, [getCurrentTheme, checkContrast])

  // CSS変数を取得するヘルパー
  const getContrastVariable = useCallback((name: keyof HighContrastColors) => {
    return `var(--contrast-${name})`
  }, [])

  // ハイコントラスト用のクラス名を生成
  const getContrastClassName = useCallback((baseClass: string, contrastClass: string) => {
    return isHighContrastEnabled ? `${baseClass} ${contrastClass}` : baseClass
  }, [isHighContrastEnabled])

  return {
    isHighContrastEnabled,
    currentTheme,
    isSystemHighContrast,
    toggleHighContrast,
    changeTheme,
    getCurrentTheme,
    getAvailableThemes,
    checkContrast,
    validateCurrentTheme,
    getContrastVariable,
    getContrastClassName,
    
    // 便利なプロパティ
    colors: getCurrentTheme().colors,
    isWcagAAA: getCurrentTheme().wcagAAA
  }
}