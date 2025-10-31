'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TestSelectPopoverProps {
  value: string
  onValueChange: (value: string) => void
}

const TEST_OPTIONS = ['オプション1', 'オプション2', 'オプション3', 'オプション4', 'オプション5']

export function TestSelectPopover({ value, onValueChange }: TestSelectPopoverProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-auto !border-0 !bg-transparent !shadow-none hover:!bg-transparent focus:!ring-0 [&_svg]:hidden">
        <SelectValue placeholder="テスト" />
      </SelectTrigger>
      <SelectContent side="bottom" align="start" className="max-h-[240px] overflow-y-auto">
        {TEST_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
