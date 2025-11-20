'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * 15分刻みの時刻オプションを生成（00:00 ~ 23:45）
 */
function generateTimeOptions(): string[] {
  const options: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hourStr = hour.toString().padStart(2, '0')
      const minuteStr = minute.toString().padStart(2, '0')
      options.push(`${hourStr}:${minuteStr}`)
    }
  }
  return options
}

/**
 * 入力値を時刻形式にパース
 * - "10" → "10:00"
 * - "1030" → "10:30"
 * - "10:30" → "10:30"
 * - "15:09" → "15:09"
 */
function parseTimeInput(input: string): string {
  if (!input) return ''

  // 既にHH:MM形式の場合はそのまま
  if (/^\d{1,2}:\d{1,2}$/.test(input)) {
    const [hour, minute] = input.split(':')
    const hourNum = parseInt(hour, 10)
    const minuteNum = parseInt(minute, 10)

    if (hourNum >= 0 && hourNum < 24 && minuteNum >= 0 && minuteNum < 60) {
      return `${hourNum.toString().padStart(2, '0')}:${minuteNum.toString().padStart(2, '0')}`
    }
    // バリデーションエラー（25:00など）の場合は空文字を返す
    return ''
  }

  // 数字のみの場合
  const digitsOnly = input.replace(/\D/g, '')

  if (digitsOnly.length === 1 || digitsOnly.length === 2) {
    // "10" → "10:00"
    const hour = parseInt(digitsOnly, 10)
    if (hour >= 0 && hour < 24) {
      return `${hour.toString().padStart(2, '0')}:00`
    }
  } else if (digitsOnly.length === 3) {
    // "103" → "10:30"
    const hour = parseInt(digitsOnly.substring(0, 1), 10)
    const minute = parseInt(digitsOnly.substring(1), 10)
    if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    }
  } else if (digitsOnly.length === 4) {
    // "1030" → "10:30"
    const hour = parseInt(digitsOnly.substring(0, 2), 10)
    const minute = parseInt(digitsOnly.substring(2), 10)
    if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    }
  }

  return input
}

interface TimeSelectProps {
  value: string // HH:MM形式
  onChange: (time: string) => void
  label: string // "開始" または "終了"
  disabled?: boolean
}

/**
 * 時刻選択Combobox（Google Calendar風）
 * - クリック → 15分刻みのドロップダウン
 * - 直接入力も可能（スマートパース対応）
 */
export function TimeSelect({ value, onChange, label, disabled = false }: TimeSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [error, setError] = useState<string>('')
  const [skipFilter, setSkipFilter] = useState(false)
  const hasScrolledRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const timeOptions = generateTimeOptions()

  // 入力値でフィルタリングされた時刻オプション
  const filteredOptions = timeOptions.filter((option) => {
    if (skipFilter) return true // フォーカス直後はフィルタリングをスキップ
    if (!inputValue) return true
    const cleanInput = inputValue.replace(/[^\d:]/g, '')
    if (!cleanInput) return true
    return option.includes(cleanInput)
  })

  // value が変更されたら inputValue も更新
  useEffect(() => {
    setInputValue(value)
  }, [value])

  // 外側クリックでポップアップを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        // フォーカスが外れた時にパース処理を実行
        if (inputValue !== value) {
          const parsed = parseTimeInput(inputValue)
          onChange(parsed)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [inputValue, value, onChange])

  // ドロップダウンを開いた時、選択中の時刻または現在時刻に近い時刻を中央に表示（初回のみ）
  useEffect(() => {
    if (isOpen && listRef.current && !hasScrolledRef.current) {
      let targetIndex = -1

      if (value) {
        // 値が設定されている場合: その値を中央に表示
        targetIndex = filteredOptions.indexOf(value)
      } else {
        // 値が空の場合: 現在時刻に最も近い時刻を中央に表示
        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()
        const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${Math.floor(currentMinute / 15) * 15}`
        targetIndex = filteredOptions.indexOf(currentTimeStr)
      }

      if (targetIndex !== -1) {
        const itemHeight = 32 // py-1.5 = 6px*2 + text height ≈ 32px
        const containerHeight = 200 // max-h-[200px]
        // 選択された項目を中央に配置
        listRef.current.scrollTop = targetIndex * itemHeight - containerHeight / 2 + itemHeight / 2
        hasScrolledRef.current = true
      }
    }
    // ドロップダウンを閉じたらフラグをリセット
    if (!isOpen) {
      hasScrolledRef.current = false
    }
  }, [isOpen, value, filteredOptions])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setHighlightedIndex(-1) // 入力時はハイライトをリセット
    setError('') // 入力中はエラーをクリア
    setSkipFilter(false) // 入力が始まったらフィルタリングを有効化

    // ドロップダウンを開く（フィルタリングのため）
    if (!isOpen) {
      setIsOpen(true)
    }
  }

  const handleInputBlur = () => {
    // フォーカスが外れたら入力値をパース
    const parsed = parseTimeInput(inputValue)
    if (parsed !== inputValue) {
      onChange(parsed)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        // ハイライトされた選択肢を確定
        const selected = filteredOptions[highlightedIndex]
        onChange(selected)
        setInputValue(selected)
      } else {
        // 入力値をパース
        const parsed = parseTimeInput(inputValue)
        onChange(parsed)
      }
      setIsOpen(false)
      setHighlightedIndex(-1)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!isOpen) {
        // ドロップダウンが閉じている場合: 15分減算
        if (value) {
          const [hour, minute] = value.split(':').map(Number)
          let totalMinutes = hour * 60 + minute - 15
          if (totalMinutes < 0) totalMinutes += 24 * 60 // 0時を下回ったら23:45に
          const newHour = Math.floor(totalMinutes / 60) % 24
          const newMinute = totalMinutes % 60
          const newTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`
          onChange(newTime)
        }
      } else {
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev))
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        // ドロップダウンが閉じている場合: 15分加算
        if (value) {
          const [hour, minute] = value.split(':').map(Number)
          let totalMinutes = hour * 60 + minute + 15
          if (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60 // 24:00を超えたら0:00に
          const newHour = Math.floor(totalMinutes / 60) % 24
          const newMinute = totalMinutes % 60
          const newTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`
          onChange(newTime)
        }
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setHighlightedIndex(-1)
    } else if (e.key === 'Tab') {
      // Tabキーで次のフィールドに移動する前にパース
      const parsed = parseTimeInput(inputValue)
      if (parsed !== inputValue) {
        onChange(parsed)
      }
      setIsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  const handleInputFocus = () => {
    // フォーカス時に全選択（ユーザーが新しい値を入力しやすくする）
    if (inputRef.current) {
      inputRef.current.select()
    }
    setSkipFilter(true) // フォーカス時はフィルタリングをスキップ
    setIsOpen(true)
  }

  const handleOptionClick = (option: string) => {
    onChange(option)
    setInputValue(option)
    setIsOpen(false)
    setHighlightedIndex(-1)
    setSkipFilter(false) // 選択後はフィルタリングを有効化
  }

  return (
    <div className={label ? 'space-y-1' : ''}>
      {label && <label className="text-muted-foreground text-xs">{label}</label>}
      <div className="relative" ref={containerRef}>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="time-listbox"
          aria-autocomplete="list"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          disabled={disabled}
          placeholder="10:00"
          className={`flex h-8 w-[48px] bg-transparent px-0 py-1 text-center text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
            value ? 'text-foreground' : 'text-muted-foreground'
          }`}
        />

        {isOpen && !disabled && filteredOptions.length > 0 && (
          <div className="border-input bg-popover absolute top-11 left-0 z-50 w-[88px] overflow-hidden rounded-md border shadow-md">
            <div
              id="time-listbox"
              ref={listRef}
              role="listbox"
              className="scrollbar-thin max-h-[200px] overflow-y-auto p-1"
              style={{
                scrollbarColor: 'color-mix(in oklch, var(--color-muted-foreground) 30%, transparent) transparent',
              }}
            >
              {filteredOptions.map((option, index) => (
                <button
                  key={option}
                  role="option"
                  aria-selected={option === value}
                  type="button"
                  className={`hover:bg-accent w-full rounded-sm px-2 py-1.5 text-left text-sm ${
                    index === highlightedIndex ? 'bg-accent/80' : option === value ? 'bg-accent/50' : ''
                  }`}
                  onClick={() => handleOptionClick(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
