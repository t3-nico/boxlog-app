import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { StarRating } from './star-rating';

const meta = {
  title: 'Components/StarRating',
  component: StarRating,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 5, step: 1 },
      description: '現在の値（1-5）',
    },
    max: {
      control: { type: 'number', min: 1, max: 10 },
      description: '最大値',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'サイズ',
    },
    disabled: {
      control: 'boolean',
      description: '無効状態',
    },
    readOnly: {
      control: 'boolean',
      description: '読み取り専用',
    },
  },
} satisfies Meta<typeof StarRating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultStarRating() {
    const [value, setValue] = useState<number | null>(3);
    return <StarRating value={value} onChange={setValue} />;
  },
};

export const Empty: Story = {
  render: function EmptyStarRating() {
    const [value, setValue] = useState<number | null>(null);
    return <StarRating value={value} onChange={setValue} />;
  },
};

export const Sizes: Story = {
  render: function SizesStarRating() {
    const [valueSm, setValueSm] = useState<number | null>(4);
    const [valueMd, setValueMd] = useState<number | null>(4);
    return (
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">sm</p>
          <StarRating value={valueSm} onChange={setValueSm} size="sm" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">md（デフォルト）</p>
          <StarRating value={valueMd} onChange={setValueMd} size="md" />
        </div>
      </div>
    );
  },
};

export const ReadOnly: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <StarRating value={5} onChange={() => {}} readOnly />
        <span className="text-sm">5.0</span>
      </div>
      <div className="flex items-center gap-2">
        <StarRating value={4} onChange={() => {}} readOnly />
        <span className="text-sm">4.0</span>
      </div>
      <div className="flex items-center gap-2">
        <StarRating value={3} onChange={() => {}} readOnly />
        <span className="text-sm">3.0</span>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => <StarRating value={3} onChange={() => {}} disabled />,
};

export const CustomMax: Story = {
  render: function CustomMaxStarRating() {
    const [value, setValue] = useState<number | null>(7);
    return (
      <div className="space-y-2">
        <StarRating value={value} onChange={setValue} max={10} />
        <p className="text-sm text-muted-foreground">
          {value} / 10
        </p>
      </div>
    );
  },
};

export const Interactive: Story = {
  render: function InteractiveStarRating() {
    const [value, setValue] = useState<number | null>(null);
    return (
      <div className="space-y-4">
        <StarRating value={value} onChange={setValue} />
        <p className="text-sm text-muted-foreground">
          評価: {value !== null ? `${value}点` : '未評価'}
        </p>
        <p className="text-xs text-muted-foreground">
          ※同じ星をクリックでリセット
        </p>
      </div>
    );
  },
};

export const AllVariants: Story = {
  render: function AllVariantsStarRating() {
    const [rating1, setRating1] = useState<number | null>(4);
    const [rating2, setRating2] = useState<number | null>(null);
    return (
      <div className="p-8 bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-8">StarRating - 全バリエーション</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4">インタラクティブ</h2>
            <StarRating value={rating1} onChange={setRating1} />
            <p className="text-sm text-muted-foreground mt-2">
              クリックで選択、同じ星で解除
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">未評価から開始</h2>
            <StarRating value={rating2} onChange={setRating2} />
            <p className="text-sm text-muted-foreground mt-2">
              現在: {rating2 !== null ? `${rating2}点` : '未評価'}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">サイズ</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <StarRating value={4} onChange={() => {}} size="sm" readOnly />
                <span className="text-sm">sm</span>
              </div>
              <div className="flex items-center gap-4">
                <StarRating value={4} onChange={() => {}} size="md" readOnly />
                <span className="text-sm">md</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">読み取り専用</h2>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((score) => (
                <div key={score} className="flex items-center gap-2">
                  <StarRating value={score} onChange={() => {}} readOnly size="sm" />
                  <span className="text-sm">{score}.0</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">無効</h2>
            <StarRating value={3} onChange={() => {}} disabled />
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">使用場面</h2>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              <li>商品レビュー</li>
              <li>フィードバック収集</li>
              <li>満足度評価</li>
              <li>難易度表示</li>
            </ul>
          </section>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
