import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { Textarea } from './textarea';

/**
 * Textarea - 複数行テキスト入力
 *
 * ## Textarea vs Input
 *
 * | 観点 | Textarea | Input |
 * |------|----------|-------|
 * | 行数 | 複数行 | 単一行 |
 * | 用途 | メモ、説明、コメント | 名前、メール、URL |
 * | 文字数 | 長め（100〜500以上） | 短め（〜100程度） |
 * | 推奨 | 詳細説明、フィードバック | フォームフィールド |
 *
 * ## 使い分けルール（Material Design準拠）
 *
 * - **50文字以下想定**: Input（単一行で収まる）
 * - **改行が必要**: Textarea（複数行表示）
 * - **自由記述**: Textarea（長文対応）
 * - **定型入力**: Input（メール、電話番号など）
 *
 * ## リサイズ
 *
 * - **基本**: `resize-none`（固定高さ + スクロール）
 * - **理由**: レイアウト崩れ防止、モバイル対応
 *
 * ## 文字数カウンター
 *
 * maxLengthを設定する場合は、文字数カウンターを表示することを推奨。
 * - **位置**: Textareaの上（ラベルとTextareaの間）
 * - **配置**: サポートテキストと同じ行で右寄せ
 * - **理由**: 入力前に「どれくらい書けるか」が分かる
 *
 * 実装例は tag-note-field.tsx を参照。
 */
const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'メモを入力...',
    className: 'w-80',
  },
};

export const AllPatterns: Story = {
  render: function AllPatternsStory() {
    const MAX_LENGTH = 200;
    const [value, setValue] = useState('');

    return (
      <div>
        <h1 className="mb-2 text-2xl font-bold">Textarea</h1>
        <p className="text-muted-foreground mb-8">複数行テキスト入力</p>

        <div className="grid gap-8" style={{ maxWidth: '28rem' }}>
          {/* 基本（文字数カウンター付き） */}
          <section>
            <h2 className="mb-2 text-lg font-bold">基本</h2>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-muted-foreground text-sm">メモを入力</span>
              <span className="text-muted-foreground text-xs tabular-nums">
                {value.length}/{MAX_LENGTH}
              </span>
            </div>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="メモを入力..."
              maxLength={MAX_LENGTH}
              className="min-h-[80px] resize-none"
            />
          </section>

          {/* 状態 */}
          <section>
            <h2 className="mb-4 text-lg font-bold">状態</h2>
            <div className="space-y-4">
              <Textarea placeholder="通常" className="min-h-[80px] resize-none" />
              <Textarea placeholder="無効" disabled className="min-h-[80px] resize-none" />
              <Textarea
                placeholder="エラー状態"
                aria-invalid="true"
                className="min-h-[80px] resize-none"
              />
            </div>
          </section>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
