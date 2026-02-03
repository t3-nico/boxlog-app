import type { Meta, StoryObj } from '@storybook/react';
import { Check } from 'lucide-react';
import { useState } from 'react';

import { Label } from './label';
import { RadioGroup, RadioGroupItem } from './radio-group';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    value: {
      control: 'text',
      description: '選択されている値',
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultRadioGroup() {
    const [value, setValue] = useState('option1');
    return (
      <RadioGroup value={value} onValueChange={setValue}>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="option1" id="r1" />
          <Label htmlFor="r1">オプション1</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="option2" id="r2" />
          <Label htmlFor="r2">オプション2</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="option3" id="r3" />
          <Label htmlFor="r3">オプション3</Label>
        </div>
      </RadioGroup>
    );
  },
};

export const ChipStyle: Story = {
  render: function ChipStyleRadioGroup() {
    const [value, setValue] = useState('daily');
    const options = [
      { value: 'daily', label: '日' },
      { value: 'weekly', label: '週' },
      { value: 'monthly', label: '月' },
    ];

    return (
      <RadioGroup value={value} onValueChange={setValue}>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <Label
              key={option.value}
              htmlFor={`chip-${option.value}`}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                value === option.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <RadioGroupItem
                value={option.value}
                id={`chip-${option.value}`}
                className="sr-only"
              />
              {option.label}
            </Label>
          ))}
        </div>
      </RadioGroup>
    );
  },
};

export const ListStyle: Story = {
  render: function ListStyleRadioGroup() {
    const [value, setValue] = useState('light');
    const options = [
      { value: 'light', label: 'ライト' },
      { value: 'dark', label: 'ダーク' },
      { value: 'system', label: 'システム' },
    ];

    return (
      <RadioGroup value={value} onValueChange={setValue}>
        <div className="border-border bg-card rounded-md border w-64">
          {options.map((option, index) => (
            <Label
              key={option.value}
              htmlFor={`list-${option.value}`}
              className={`hover:bg-muted flex cursor-pointer items-center justify-between px-4 py-3 text-sm transition-colors ${
                index !== options.length - 1 ? 'border-border border-b' : ''
              }`}
            >
              <span>{option.label}</span>
              <RadioGroupItem
                value={option.value}
                id={`list-${option.value}`}
                className="sr-only"
              />
              {value === option.value && <Check className="text-primary size-4" />}
            </Label>
          ))}
        </div>
      </RadioGroup>
    );
  },
};

export const AllVariants: Story = {
  render: function AllVariantsStory() {
    const [chipValue, setChipValue] = useState('daily');
    const [listValue, setListValue] = useState('light');

    const periodOptions = [
      { value: 'daily', label: '日' },
      { value: 'weekly', label: '週' },
      { value: 'monthly', label: '月' },
    ];

    const themeOptions = [
      { value: 'light', label: 'ライト' },
      { value: 'dark', label: 'ダーク' },
      { value: 'system', label: 'システム' },
    ];

    return (
      <div className="p-8 bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-8">RadioGroup - 実際の使用パターン</h1>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4">チップスタイル（横並び）</h2>
            <p className="text-sm text-muted-foreground mb-4">
              RadioGroupItemはsr-onlyで非表示、Labelがクリック対象
            </p>
            <RadioGroup value={chipValue} onValueChange={setChipValue}>
              <div className="flex flex-wrap gap-2">
                {periodOptions.map((option) => (
                  <Label
                    key={option.value}
                    htmlFor={`all-chip-${option.value}`}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                      chipValue === option.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={`all-chip-${option.value}`}
                      className="sr-only"
                    />
                    {option.label}
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">リストスタイル（Apple Settings風）</h2>
            <p className="text-sm text-muted-foreground mb-4">
              選択中はCheckアイコンを表示
            </p>
            <RadioGroup value={listValue} onValueChange={setListValue}>
              <div className="border-border bg-card rounded-md border w-64">
                {themeOptions.map((option, index) => (
                  <Label
                    key={option.value}
                    htmlFor={`all-list-${option.value}`}
                    className={`hover:bg-muted flex cursor-pointer items-center justify-between px-4 py-3 text-sm transition-colors ${
                      index !== themeOptions.length - 1 ? 'border-border border-b' : ''
                    }`}
                  >
                    <span>{option.label}</span>
                    <RadioGroupItem
                      value={option.value}
                      id={`all-list-${option.value}`}
                      className="sr-only"
                    />
                    {listValue === option.value && <Check className="text-primary size-4" />}
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </section>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
