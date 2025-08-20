/**
 * コンポーネントトークンシステム - BoxLog統一仕様
 * セマンティックトークンから各コンポーネント専用のトークンを定義
 */

import {
  primitiveSpacing,
  primitiveTypography,
  primitiveBorderRadius,
  primitiveShadows,
  primitiveShadowsDark,
  primitiveTransitions,
  primitiveZIndex,
  semanticBackground,
  semanticText,
  semanticBorder,
  semanticInteraction,
  semanticState,
  semanticFeedback,
} from './design-tokens'

// ===== ボタンコンポーネントトークン =====

export const buttonTokens = {
  // サイズバリエーション
  size: {
    xs: {
      height: primitiveSpacing[6].value,     // 24px
      paddingX: primitiveSpacing[3].value,   // 12px
      paddingY: primitiveSpacing[1].value,   // 4px
      fontSize: primitiveTypography.fontSize.xs.size,
      fontWeight: primitiveTypography.fontWeight.medium,
      borderRadius: primitiveBorderRadius.sm.value,
      iconSize: '12px',
      gap: primitiveSpacing[1].value,        // 4px
    },
    sm: {
      height: primitiveSpacing[8].value,     // 32px
      paddingX: primitiveSpacing[4].value,   // 16px
      paddingY: primitiveSpacing[2].value,   // 8px
      fontSize: primitiveTypography.fontSize.sm.size,
      fontWeight: primitiveTypography.fontWeight.medium,
      borderRadius: primitiveBorderRadius.base.value,
      iconSize: '14px',
      gap: primitiveSpacing[2].value,        // 8px
    },
    md: {
      height: primitiveSpacing[10].value,    // 40px
      paddingX: primitiveSpacing[5].value,   // 20px
      paddingY: primitiveSpacing[3].value,   // 12px
      fontSize: primitiveTypography.fontSize.base.size,
      fontWeight: primitiveTypography.fontWeight.medium,
      borderRadius: primitiveBorderRadius.md.value,
      iconSize: '16px',
      gap: primitiveSpacing[2].value,        // 8px
    },
    lg: {
      height: primitiveSpacing[12].value,    // 48px
      paddingX: primitiveSpacing[6].value,   // 24px
      paddingY: primitiveSpacing[4].value,   // 16px
      fontSize: primitiveTypography.fontSize.lg.size,
      fontWeight: primitiveTypography.fontWeight.medium,
      borderRadius: primitiveBorderRadius.lg.value,
      iconSize: '18px',
      gap: primitiveSpacing[3].value,        // 12px
    },
    xl: {
      height: primitiveSpacing[16].value,    // 64px
      paddingX: primitiveSpacing[8].value,   // 32px
      paddingY: primitiveSpacing[5].value,   // 20px
      fontSize: primitiveTypography.fontSize.xl.size,
      fontWeight: primitiveTypography.fontWeight.medium,
      borderRadius: primitiveBorderRadius.xl.value,
      iconSize: '20px',
      gap: primitiveSpacing[3].value,        // 12px
    },
  },
  
  // バリアントスタイル
  variant: {
    primary: {
      background: {
        light: semanticInteraction.primary.default.light,
        dark: semanticInteraction.primary.default.dark,
      },
      text: {
        light: semanticBackground.primary.light,
        dark: semanticBackground.primary.dark,
      },
      border: 'transparent',
      hover: {
        background: {
          light: semanticInteraction.primary.hover.light,
          dark: semanticInteraction.primary.hover.dark,
        },
      },
      active: {
        background: {
          light: semanticInteraction.primary.active.light,
          dark: semanticInteraction.primary.active.dark,
        },
      },
      disabled: {
        background: {
          light: semanticInteraction.primary.disabled.light,
          dark: semanticInteraction.primary.disabled.dark,
        },
        text: {
          light: semanticText.disabled.light,
          dark: semanticText.disabled.dark,
        },
      },
      shadow: primitiveShadows.sm,
      shadowDark: primitiveShadowsDark.sm,
    },
    
    secondary: {
      background: {
        light: semanticInteraction.secondary.default.light,
        dark: semanticInteraction.secondary.default.dark,
      },
      text: {
        light: semanticText.primary.light,
        dark: semanticText.primary.dark,
      },
      border: {
        light: semanticBorder.primary.light,
        dark: semanticBorder.primary.dark,
      },
      hover: {
        background: {
          light: semanticInteraction.secondary.hover.light,
          dark: semanticInteraction.secondary.hover.dark,
        },
      },
      active: {
        background: {
          light: semanticInteraction.secondary.active.light,
          dark: semanticInteraction.secondary.active.dark,
        },
      },
      shadow: primitiveShadows.xs,
      shadowDark: primitiveShadowsDark.xs,
    },
    
    accent: {
      background: {
        light: semanticInteraction.accent.default.light,
        dark: semanticInteraction.accent.default.dark,
      },
      text: {
        light: semanticBackground.primary.light,
        dark: semanticBackground.primary.dark,
      },
      border: 'transparent',
      hover: {
        background: {
          light: semanticInteraction.accent.hover.light,
          dark: semanticInteraction.accent.hover.dark,
        },
      },
      active: {
        background: {
          light: semanticInteraction.accent.active.light,
          dark: semanticInteraction.accent.active.dark,
        },
      },
      shadow: primitiveShadows.sm,
      shadowDark: primitiveShadowsDark.sm,
    },
    
    ghost: {
      background: 'transparent',
      text: {
        light: semanticText.primary.light,
        dark: semanticText.primary.dark,
      },
      border: 'transparent',
      hover: {
        background: {
          light: semanticInteraction.secondary.default.light,
          dark: semanticInteraction.secondary.default.dark,
        },
      },
      active: {
        background: {
          light: semanticInteraction.secondary.hover.light,
          dark: semanticInteraction.secondary.hover.dark,
        },
      },
      shadow: 'none',
      shadowDark: 'none',
    },
  },
  
  // 共通プロパティ
  transition: primitiveTransitions.duration.fast,
  easing: primitiveTransitions.easing.standard,
  focusRing: {
    light: semanticFeedback.focus.ring.light,
    dark: semanticFeedback.focus.ring.dark,
  },
} as const

// ===== インプットコンポーネントトークン =====

export const inputTokens = {
  size: {
    sm: {
      height: primitiveSpacing[8].value,     // 32px
      paddingX: primitiveSpacing[3].value,   // 12px
      paddingY: primitiveSpacing[2].value,   // 8px
      fontSize: primitiveTypography.fontSize.sm.size,
      borderRadius: primitiveBorderRadius.base.value,
    },
    md: {
      height: primitiveSpacing[10].value,    // 40px
      paddingX: primitiveSpacing[4].value,   // 16px
      paddingY: primitiveSpacing[3].value,   // 12px
      fontSize: primitiveTypography.fontSize.base.size,
      borderRadius: primitiveBorderRadius.md.value,
    },
    lg: {
      height: primitiveSpacing[12].value,    // 48px
      paddingX: primitiveSpacing[5].value,   // 20px
      paddingY: primitiveSpacing[4].value,   // 16px
      fontSize: primitiveTypography.fontSize.lg.size,
      borderRadius: primitiveBorderRadius.lg.value,
    },
  },
  
  style: {
    default: {
      background: {
        light: semanticBackground.primary.light,
        dark: semanticBackground.tertiary.dark,
      },
      text: {
        light: semanticText.primary.light,
        dark: semanticText.primary.dark,
      },
      placeholder: {
        light: semanticText.placeholder.light,
        dark: semanticText.placeholder.dark,
      },
      border: {
        light: semanticBorder.primary.light,
        dark: semanticBorder.primary.dark,
      },
      shadow: primitiveShadows.inner,
      shadowDark: primitiveShadowsDark.inner,
    },
    
    focus: {
      border: {
        light: semanticFeedback.focus.ring.light,
        dark: semanticFeedback.focus.ring.dark,
      },
      ring: {
        light: semanticFeedback.focus.ring.light,
        dark: semanticFeedback.focus.ring.dark,
      },
      ringOpacity: '0.2',
      ringWidth: '2px',
      ringOffset: '0px',
    },
    
    error: {
      border: {
        light: semanticState.error.border.light,
        dark: semanticState.error.border.dark,
      },
      background: {
        light: semanticState.error.background.light,
        dark: semanticState.error.background.dark,
      },
      text: {
        light: semanticState.error.text.light,
        dark: semanticState.error.text.dark,
      },
    },
    
    disabled: {
      background: {
        light: semanticBackground.secondary.light,
        dark: semanticBackground.secondary.dark,
      },
      text: {
        light: semanticText.disabled.light,
        dark: semanticText.disabled.dark,
      },
      border: {
        light: semanticBorder.subtle.light,
        dark: semanticBorder.subtle.dark,
      },
      cursor: 'not-allowed',
      opacity: '0.6',
    },
  },
  
  transition: primitiveTransitions.duration.fast,
  easing: primitiveTransitions.easing.standard,
} as const

// ===== カードコンポーネントトークン =====

export const cardTokens = {
  size: {
    sm: {
      padding: primitiveSpacing[4].value,    // 16px
      borderRadius: primitiveBorderRadius.md.value,
      gap: primitiveSpacing[3].value,        // 12px
    },
    md: {
      padding: primitiveSpacing[6].value,    // 24px
      borderRadius: primitiveBorderRadius.lg.value,
      gap: primitiveSpacing[4].value,        // 16px
    },
    lg: {
      padding: primitiveSpacing[8].value,    // 32px
      borderRadius: primitiveBorderRadius.xl.value,
      gap: primitiveSpacing[6].value,        // 24px
    },
  },
  
  style: {
    default: {
      background: {
        light: semanticBackground.card.light,
        dark: semanticBackground.card.dark,
      },
      border: {
        light: semanticBorder.primary.light,
        dark: semanticBorder.primary.dark,
      },
      shadow: primitiveShadows.sm,
      shadowDark: primitiveShadowsDark.sm,
    },
    
    elevated: {
      background: {
        light: semanticBackground.elevated.light,
        dark: semanticBackground.elevated.dark,
      },
      border: {
        light: semanticBorder.subtle.light,
        dark: semanticBorder.subtle.dark,
      },
      shadow: primitiveShadows.md,
      shadowDark: primitiveShadowsDark.md,
    },
    
    outlined: {
      background: 'transparent',
      border: {
        light: semanticBorder.primary.light,
        dark: semanticBorder.primary.dark,
      },
      shadow: 'none',
      shadowDark: 'none',
    },
  },
  
  header: {
    padding: primitiveSpacing[6].value,      // 24px
    borderBottom: {
      light: semanticBorder.primary.light,
      dark: semanticBorder.primary.dark,
    },
  },
  
  content: {
    padding: primitiveSpacing[6].value,      // 24px
  },
  
  footer: {
    padding: primitiveSpacing[6].value,      // 24px
    borderTop: {
      light: semanticBorder.primary.light,
      dark: semanticBorder.primary.dark,
    },
  },
} as const

// ===== タイポグラフィコンポーネントトークン =====

export const typographyTokens = {
  heading: {
    h1: {
      fontSize: primitiveTypography.fontSize['5xl'].size,
      lineHeight: primitiveTypography.fontSize['5xl'].lineHeight,
      fontWeight: primitiveTypography.fontWeight.bold,
      letterSpacing: primitiveTypography.letterSpacing.tight,
      marginBottom: primitiveSpacing[8].value,
      color: {
        light: semanticText.primary.light,
        dark: semanticText.primary.dark,
      },
    },
    h2: {
      fontSize: primitiveTypography.fontSize['4xl'].size,
      lineHeight: primitiveTypography.fontSize['4xl'].lineHeight,
      fontWeight: primitiveTypography.fontWeight.bold,
      letterSpacing: primitiveTypography.letterSpacing.tight,
      marginBottom: primitiveSpacing[6].value,
      color: {
        light: semanticText.primary.light,
        dark: semanticText.primary.dark,
      },
    },
    h3: {
      fontSize: primitiveTypography.fontSize['3xl'].size,
      lineHeight: primitiveTypography.fontSize['3xl'].lineHeight,
      fontWeight: primitiveTypography.fontWeight.semibold,
      letterSpacing: primitiveTypography.letterSpacing.tight,
      marginBottom: primitiveSpacing[5].value,
      color: {
        light: semanticText.primary.light,
        dark: semanticText.primary.dark,
      },
    },
    h4: {
      fontSize: primitiveTypography.fontSize['2xl'].size,
      lineHeight: primitiveTypography.fontSize['2xl'].lineHeight,
      fontWeight: primitiveTypography.fontWeight.semibold,
      letterSpacing: primitiveTypography.letterSpacing.normal,
      marginBottom: primitiveSpacing[4].value,
      color: {
        light: semanticText.primary.light,
        dark: semanticText.primary.dark,
      },
    },
    h5: {
      fontSize: primitiveTypography.fontSize.xl.size,
      lineHeight: primitiveTypography.fontSize.xl.lineHeight,
      fontWeight: primitiveTypography.fontWeight.semibold,
      letterSpacing: primitiveTypography.letterSpacing.normal,
      marginBottom: primitiveSpacing[3].value,
      color: {
        light: semanticText.primary.light,
        dark: semanticText.primary.dark,
      },
    },
    h6: {
      fontSize: primitiveTypography.fontSize.lg.size,
      lineHeight: primitiveTypography.fontSize.lg.lineHeight,
      fontWeight: primitiveTypography.fontWeight.medium,
      letterSpacing: primitiveTypography.letterSpacing.normal,
      marginBottom: primitiveSpacing[2].value,
      color: {
        light: semanticText.primary.light,
        dark: semanticText.primary.dark,
      },
    },
  },
  
  body: {
    large: {
      fontSize: primitiveTypography.fontSize.lg.size,
      lineHeight: primitiveTypography.lineHeight.relaxed,
      fontWeight: primitiveTypography.fontWeight.normal,
      color: {
        light: semanticText.primary.light,
        dark: semanticText.primary.dark,
      },
    },
    medium: {
      fontSize: primitiveTypography.fontSize.base.size,
      lineHeight: primitiveTypography.lineHeight.normal,
      fontWeight: primitiveTypography.fontWeight.normal,
      color: {
        light: semanticText.primary.light,
        dark: semanticText.primary.dark,
      },
    },
    small: {
      fontSize: primitiveTypography.fontSize.sm.size,
      lineHeight: primitiveTypography.lineHeight.normal,
      fontWeight: primitiveTypography.fontWeight.normal,
      color: {
        light: semanticText.secondary.light,
        dark: semanticText.secondary.dark,
      },
    },
    caption: {
      fontSize: primitiveTypography.fontSize.xs.size,
      lineHeight: primitiveTypography.lineHeight.snug,
      fontWeight: primitiveTypography.fontWeight.normal,
      color: {
        light: semanticText.muted.light,
        dark: semanticText.muted.dark,
      },
    },
  },
  
  code: {
    inline: {
      fontSize: primitiveTypography.fontSize.sm.size,
      fontFamily: primitiveTypography.fontFamily.mono,
      padding: `${primitiveSpacing[1].value} ${primitiveSpacing[2].value}`,
      borderRadius: primitiveBorderRadius.sm.value,
      background: {
        light: semanticBackground.secondary.light,
        dark: semanticBackground.secondary.dark,
      },
      color: {
        light: semanticText.primary.light,
        dark: semanticText.primary.dark,
      },
    },
    block: {
      fontSize: primitiveTypography.fontSize.sm.size,
      fontFamily: primitiveTypography.fontFamily.mono,
      padding: primitiveSpacing[4].value,
      borderRadius: primitiveBorderRadius.md.value,
      background: {
        light: semanticBackground.secondary.light,
        dark: semanticBackground.secondary.dark,
      },
      border: {
        light: semanticBorder.primary.light,
        dark: semanticBorder.primary.dark,
      },
      color: {
        light: semanticText.primary.light,
        dark: semanticText.primary.dark,
      },
    },
  },
} as const

// ===== バッジ・タグコンポーネントトークン =====

export const badgeTokens = {
  size: {
    sm: {
      fontSize: primitiveTypography.fontSize.xs.size,
      padding: `${primitiveSpacing[1].value} ${primitiveSpacing[2].value}`,
      borderRadius: primitiveBorderRadius.sm.value,
      height: primitiveSpacing[5].value,
    },
    md: {
      fontSize: primitiveTypography.fontSize.sm.size,
      padding: `${primitiveSpacing[1].value} ${primitiveSpacing[3].value}`,
      borderRadius: primitiveBorderRadius.base.value,
      height: primitiveSpacing[6].value,
    },
    lg: {
      fontSize: primitiveTypography.fontSize.base.size,
      padding: `${primitiveSpacing[2].value} ${primitiveSpacing[4].value}`,
      borderRadius: primitiveBorderRadius.md.value,
      height: primitiveSpacing[8].value,
    },
  },
  
  variant: {
    default: {
      background: {
        light: semanticBackground.secondary.light,
        dark: semanticBackground.secondary.dark,
      },
      text: {
        light: semanticText.primary.light,
        dark: semanticText.primary.dark,
      },
      border: {
        light: semanticBorder.primary.light,
        dark: semanticBorder.primary.dark,
      },
    },
    
    primary: {
      background: {
        light: semanticInteraction.primary.default.light,
        dark: semanticInteraction.primary.default.dark,
      },
      text: {
        light: semanticBackground.primary.light,
        dark: semanticBackground.primary.dark,
      },
      border: 'transparent',
    },
    
    success: {
      background: {
        light: semanticState.success.background.light,
        dark: semanticState.success.background.dark,
      },
      text: {
        light: semanticState.success.text.light,
        dark: semanticState.success.text.dark,
      },
      border: {
        light: semanticState.success.border.light,
        dark: semanticState.success.border.dark,
      },
    },
    
    warning: {
      background: {
        light: semanticState.warning.background.light,
        dark: semanticState.warning.background.dark,
      },
      text: {
        light: semanticState.warning.text.light,
        dark: semanticState.warning.text.dark,
      },
      border: {
        light: semanticState.warning.border.light,
        dark: semanticState.warning.border.dark,
      },
    },
    
    error: {
      background: {
        light: semanticState.error.background.light,
        dark: semanticState.error.background.dark,
      },
      text: {
        light: semanticState.error.text.light,
        dark: semanticState.error.text.dark,
      },
      border: {
        light: semanticState.error.border.light,
        dark: semanticState.error.border.dark,
      },
    },
  },
} as const

// ===== モーダル・ダイアログコンポーネントトークン =====

export const modalTokens = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    zIndex: primitiveZIndex.overlay,
  },
  
  content: {
    background: {
      light: semanticBackground.elevated.light,
      dark: semanticBackground.elevated.dark,
    },
    borderRadius: primitiveBorderRadius.xl.value,
    shadow: primitiveShadows.xl,
    shadowDark: primitiveShadowsDark.xl,
    zIndex: primitiveZIndex.modal,
    border: {
      light: semanticBorder.primary.light,
      dark: semanticBorder.primary.dark,
    },
  },
  
  size: {
    sm: {
      width: '400px',
      maxWidth: '90vw',
      maxHeight: '90vh',
    },
    md: {
      width: '500px',
      maxWidth: '90vw',
      maxHeight: '90vh',
    },
    lg: {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '95vh',
    },
    xl: {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '95vh',
    },
    full: {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
    },
  },
  
  animation: {
    duration: primitiveTransitions.duration.normal,
    easing: primitiveTransitions.easing.spring,
  },
} as const

// ===== カレンダー専用コンポーネントトークン =====

export const calendarTokens = {
  grid: {
    hourHeight: {
      mobile: '48px',    // 3rem
      tablet: '60px',    // 3.75rem
      desktop: '72px',   // 4.5rem
    },
    timeColumnWidth: '64px', // 4rem
    headerHeight: '64px',    // 4rem
    sidebarWidth: '256px',   // 16rem
    
    lineColor: {
      light: semanticBorder.subtle.light,
      dark: semanticBorder.subtle.dark,
    },
    
    businessHours: {
      background: {
        light: semanticBackground.secondary.light,
        dark: semanticBackground.secondary.dark,
      },
      opacity: '0.3',
    },
  },
  
  event: {
    background: {
      light: semanticInteraction.primary.default.light,
      dark: semanticInteraction.primary.default.dark,
    },
    text: {
      light: semanticBackground.primary.light,
      dark: semanticBackground.primary.dark,
    },
    borderRadius: primitiveBorderRadius.md.value,
    padding: primitiveSpacing[2].value,
    shadow: primitiveShadows.sm,
    shadowDark: primitiveShadowsDark.sm,
    
    hover: {
      background: {
        light: semanticInteraction.primary.hover.light,
        dark: semanticInteraction.primary.hover.dark,
      },
      shadow: primitiveShadows.md,
      shadowDark: primitiveShadowsDark.md,
    },
  },
  
  currentTimeline: {
    color: {
      light: semanticState.error.icon.light,
      dark: semanticState.error.icon.dark,
    },
    thickness: '2px',
    dotSize: '8px',
    zIndex: primitiveZIndex.raised,
  },
  
  popup: {
    background: {
      light: semanticBackground.elevated.light,
      dark: semanticBackground.elevated.dark,
    },
    border: {
      light: semanticBorder.primary.light,
      dark: semanticBorder.primary.dark,
    },
    borderRadius: primitiveBorderRadius.lg.value,
    shadow: primitiveShadows.lg,
    shadowDark: primitiveShadowsDark.lg,
    zIndex: primitiveZIndex.popover,
  },
} as const