/**
 * スケルトンローディングシステム - BoxLog統一仕様
 * データ取得中の適切なプレースホルダーとローディング状態
 */

// ===== 基本スケルトンパターン =====

export const skeletonPatterns = {
  // 基本的なシマー効果
  shimmer: {
    base: 'animate-pulse bg-gradient-to-r from-muted/50 via-muted/80 to-muted/50 bg-[length:200%_100%]',
    subtle: 'animate-pulse bg-muted/30',
    pronounced: 'animate-pulse bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40',
  },
  
  // ウェーブ効果
  wave: {
    base: 'animate-skeleton-wave bg-gradient-to-r from-transparent via-muted/50 to-transparent bg-[length:200%_100%]',
    fast: 'animate-skeleton-wave-fast bg-gradient-to-r from-transparent via-muted/50 to-transparent bg-[length:200%_100%]',
    slow: 'animate-skeleton-wave-slow bg-gradient-to-r from-transparent via-muted/50 to-transparent bg-[length:200%_100%]',
  },
  
  // フェード効果
  fade: {
    base: 'animate-skeleton-fade bg-muted/50',
    gentle: 'animate-skeleton-fade-gentle bg-muted/30',
  },
} as const

// ===== コンポーネント別スケルトン =====

export const skeletonComponents = {
  // テキスト行
  text: {
    line: 'h-4 bg-muted/50 rounded animate-pulse',
    heading: 'h-6 bg-muted/50 rounded animate-pulse',
    paragraph: 'h-4 bg-muted/50 rounded animate-pulse w-3/4',
    caption: 'h-3 bg-muted/50 rounded animate-pulse w-1/2',
  },
  
  // アバター・画像
  avatar: {
    sm: 'w-8 h-8 bg-muted/50 rounded-full animate-pulse',
    md: 'w-10 h-10 bg-muted/50 rounded-full animate-pulse',
    lg: 'w-12 h-12 bg-muted/50 rounded-full animate-pulse',
    xl: 'w-16 h-16 bg-muted/50 rounded-full animate-pulse',
  },
  
  image: {
    square: 'aspect-square bg-muted/50 rounded animate-pulse',
    landscape: 'aspect-video bg-muted/50 rounded animate-pulse',
    portrait: 'aspect-[3/4] bg-muted/50 rounded animate-pulse',
  },
  
  // ボタン
  button: {
    sm: 'h-8 w-20 bg-muted/50 rounded animate-pulse',
    md: 'h-10 w-24 bg-muted/50 rounded animate-pulse',
    lg: 'h-12 w-28 bg-muted/50 rounded animate-pulse',
    icon: 'w-10 h-10 bg-muted/50 rounded animate-pulse',
  },
  
  // インプット
  input: {
    default: 'h-10 bg-muted/50 rounded animate-pulse',
    textarea: 'h-24 bg-muted/50 rounded animate-pulse',
    select: 'h-10 bg-muted/50 rounded animate-pulse',
  },
  
  // カード
  card: {
    default: 'p-6 bg-card border rounded-lg animate-pulse',
    compact: 'p-4 bg-card border rounded animate-pulse',
    minimal: 'p-3 bg-muted/20 rounded animate-pulse',
  },
  
  // チップ・バッジ
  chip: {
    sm: 'h-6 w-16 bg-muted/50 rounded-full animate-pulse',
    md: 'h-7 w-20 bg-muted/50 rounded-full animate-pulse',
    lg: 'h-8 w-24 bg-muted/50 rounded-full animate-pulse',
  },
} as const

// ===== 複合スケルトンレイアウト =====

export const skeletonLayouts = {
  // ユーザープロフィール
  userProfile: `
    <div class="flex items-center space-x-4 animate-pulse">
      <div class="${skeletonComponents.avatar.lg}"></div>
      <div class="space-y-2 flex-1">
        <div class="${skeletonComponents.text.heading} w-1/3"></div>
        <div class="${skeletonComponents.text.line} w-1/2"></div>
      </div>
    </div>
  `,
  
  // カードリスト
  cardList: `
    <div class="space-y-4">
      ${Array(3).fill(0).map(() => `
        <div class="${skeletonComponents.card.default}">
          <div class="space-y-3">
            <div class="${skeletonComponents.text.heading} w-2/3"></div>
            <div class="${skeletonComponents.text.line} w-full"></div>
            <div class="${skeletonComponents.text.paragraph}"></div>
            <div class="flex space-x-2">
              <div class="${skeletonComponents.chip.sm}"></div>
              <div class="${skeletonComponents.chip.sm}"></div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `,
  
  // テーブル行
  tableRow: `
    <tr class="animate-pulse">
      <td class="p-4"><div class="${skeletonComponents.text.line} w-3/4"></div></td>
      <td class="p-4"><div class="${skeletonComponents.text.line} w-1/2"></div></td>
      <td class="p-4"><div class="${skeletonComponents.chip.sm}"></div></td>
      <td class="p-4"><div class="${skeletonComponents.button.icon}"></div></td>
    </tr>
  `,
  
  // フォーム
  form: `
    <div class="space-y-6 animate-pulse">
      <div class="space-y-2">
        <div class="${skeletonComponents.text.line} w-1/4"></div>
        <div class="${skeletonComponents.input.default}"></div>
      </div>
      <div class="space-y-2">
        <div class="${skeletonComponents.text.line} w-1/3"></div>
        <div class="${skeletonComponents.input.textarea}"></div>
      </div>
      <div class="flex space-x-4">
        <div class="${skeletonComponents.button.md}"></div>
        <div class="${skeletonComponents.button.md}"></div>
      </div>
    </div>
  `,
} as const

// ===== カレンダー専用スケルトン =====

export const calendarSkeletons = {
  // イベントブロック
  eventBlock: 'h-20 bg-primary/20 rounded animate-pulse border-l-4 border-primary/50',
  
  // 時間軸
  timeAxis: `
    <div class="space-y-4 animate-pulse">
      ${Array(24).fill(0).map(() => `
        <div class="flex items-center space-x-4">
          <div class="${skeletonComponents.text.caption} w-12"></div>
          <div class="flex-1 h-px bg-muted/30"></div>
        </div>
      `).join('')}
    </div>
  `,
  
  // カレンダーグリッド
  grid: `
    <div class="grid grid-cols-7 gap-2 animate-pulse">
      ${Array(35).fill(0).map(() => `
        <div class="aspect-square bg-muted/30 rounded p-2">
          <div class="${skeletonComponents.text.caption} mb-2"></div>
          <div class="space-y-1">
            <div class="h-2 bg-primary/30 rounded"></div>
            <div class="h-2 bg-secondary/30 rounded w-3/4"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `,
  
  // 月表示
  monthView: 'h-96 bg-muted/20 rounded-lg animate-pulse',
  
  // イベント詳細
  eventDetails: `
    <div class="space-y-4 animate-pulse">
      <div class="${skeletonComponents.text.heading} w-2/3"></div>
      <div class="flex items-center space-x-2">
        <div class="${skeletonComponents.chip.sm}"></div>
        <div class="${skeletonComponents.chip.sm}"></div>
      </div>
      <div class="space-y-2">
        <div class="${skeletonComponents.text.line} w-full"></div>
        <div class="${skeletonComponents.text.line} w-4/5"></div>
        <div class="${skeletonComponents.text.paragraph}"></div>
      </div>
    </div>
  `,
} as const

// ===== エラー状態アニメーション =====

export const errorAnimations = {
  // シェイク
  shake: 'animate-shake-x',
  
  // フェードインエラー
  fadeInError: 'animate-fade-in-error',
  
  // パルスエラー
  pulseError: 'animate-pulse-error border-destructive/50',
  
  // スライドインエラー
  slideInError: 'animate-slide-in-error text-destructive',
} as const

// ===== ローディング状態インジケーター =====

export const loadingIndicators = {
  // スピナー
  spinner: {
    sm: 'w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin',
    md: 'w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin',
    lg: 'w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin',
  },
  
  // ドット
  dots: {
    base: 'flex space-x-1',
    dot: 'w-2 h-2 bg-primary rounded-full animate-bounce',
    dotDelayed1: 'w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.1s]',
    dotDelayed2: 'w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]',
  },
  
  // バー
  bars: {
    base: 'flex space-x-1 items-end',
    bar: 'w-1 bg-primary animate-pulse',
    bar1: 'h-4 animate-pulse [animation-delay:0s]',
    bar2: 'h-6 animate-pulse [animation-delay:0.1s]',
    bar3: 'h-8 animate-pulse [animation-delay:0.2s]',
    bar4: 'h-6 animate-pulse [animation-delay:0.3s]',
    bar5: 'h-4 animate-pulse [animation-delay:0.4s]',
  },
  
  // プログレスバー
  progress: {
    base: 'w-full bg-muted/30 rounded-full h-2 overflow-hidden',
    fill: 'h-full bg-primary animate-progress-indeterminate',
  },
} as const

// ===== カスタムキーフレーム =====

export const skeletonKeyframes = {
  // ウェーブアニメーション
  'skeleton-wave': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  'skeleton-wave-fast': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  'skeleton-wave-slow': {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
  
  // フェードアニメーション
  'skeleton-fade': {
    '0%, 100%': { opacity: '0.5' },
    '50%': { opacity: '1' },
  },
  'skeleton-fade-gentle': {
    '0%, 100%': { opacity: '0.3' },
    '50%': { opacity: '0.7' },
  },
  
  // エラーアニメーション
  'shake-x': {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
  },
  'fade-in-error': {
    '0%': { opacity: '0', transform: 'translateY(10px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  'pulse-error': {
    '0%, 100%': { borderColor: 'rgb(var(--destructive) / 0.3)' },
    '50%': { borderColor: 'rgb(var(--destructive) / 0.8)' },
  },
  'slide-in-error': {
    '0%': { opacity: '0', transform: 'translateX(-10px)' },
    '100%': { opacity: '1', transform: 'translateX(0)' },
  },
  
  // プログレスアニメーション
  'progress-indeterminate': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
} as const

// ===== ユーティリティ関数 =====

/**
 * スケルトンクラスを生成
 */
export const generateSkeletonClass = (
  pattern: keyof typeof skeletonPatterns = 'shimmer',
  intensity: 'subtle' | 'base' | 'pronounced' = 'base'
) => {
  return skeletonPatterns[pattern][intensity]
}

/**
 * ローディング状態に応じたコンポーネント
 */
export const createLoadingWrapper = (isLoading: boolean, skeletonContent: string, actualContent: string) => {
  return isLoading ? skeletonContent : actualContent
}

/**
 * 段階的ローディング
 */
export const staggeredLoading = {
  item: (index: number, delay: number = 100) => 
    `animate-fade-in-up [animation-delay:${index * delay}ms]`,
  
  list: (itemCount: number, baseDelay: number = 100) =>
    Array.from({ length: itemCount }, (_, i) => 
      `animate-fade-in-up [animation-delay:${i * baseDelay}ms]`
    ),
}

/**
 * アクセシビリティ対応
 */
export const a11ySkeletonAttributes = {
  'aria-label': 'Loading content',
  'aria-busy': 'true',
  'role': 'status',
} as const