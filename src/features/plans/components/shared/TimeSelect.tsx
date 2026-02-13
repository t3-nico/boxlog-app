'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Clock, Flag } from 'lucide-react';

import type { TimeIconType } from '@/components/ui/clock-time-picker';

import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { zIndex } from '@/config/ui/z-index';

/**
 * 15分刻みの時刻オプションを生成（00:00 ~ 23:45）
 */
function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hourStr = hour.toString().padStart(2, '0');
      const minuteStr = minute.toString().padStart(2, '0');
      options.push(`${hourStr}:${minuteStr}`);
    }
  }
  return options;
}

/**
 * 入力値を時刻形式にパース
 * - "10" → "10:00"
 * - "1030" → "10:30"
 * - "10:30" → "10:30"
 * - "15:09" → "15:09"
 */
function parseTimeInput(input: string): string {
  if (!input) return '';

  // 既にHH:MM形式の場合はそのまま
  if (/^\d{1,2}:\d{1,2}$/.test(input)) {
    const [hour, minute] = input.split(':');
    const hourNum = parseInt(hour!, 10);
    const minuteNum = parseInt(minute!, 10);

    if (hourNum >= 0 && hourNum < 24 && minuteNum >= 0 && minuteNum < 60) {
      return `${hourNum.toString().padStart(2, '0')}:${minuteNum.toString().padStart(2, '0')}`;
    }
    // バリデーションエラー（25:00など）の場合は空文字を返す
    return '';
  }

  // 数字のみの場合
  const digitsOnly = input.replace(/\D/g, '');

  if (digitsOnly.length === 1 || digitsOnly.length === 2) {
    // "10" → "10:00"
    const hour = parseInt(digitsOnly, 10);
    if (hour >= 0 && hour < 24) {
      return `${hour.toString().padStart(2, '0')}:00`;
    }
  } else if (digitsOnly.length === 3) {
    // "103" → "10:30"
    const hour = parseInt(digitsOnly.substring(0, 1), 10);
    const minute = parseInt(digitsOnly.substring(1), 10);
    if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  } else if (digitsOnly.length === 4) {
    // "1030" → "10:30"
    const hour = parseInt(digitsOnly.substring(0, 2), 10);
    const minute = parseInt(digitsOnly.substring(2), 10);
    if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  }

  return input;
}

interface TimeSelectProps {
  value: string; // HH:MM形式
  onChange: (time: string) => void;
  label: string; // "開始" または "終了"
  disabled?: boolean;
  minTime?: string; // 最小時刻（この時刻以降のみ選択可能、HH:MM形式）
  /** 外部からのエラー状態（重複エラーなど） */
  hasError?: boolean;
  /** アイコンを表示するか（デフォルト: false） */
  showIcon?: boolean;
  /** アイコン種別（デフォルト: clock） */
  iconType?: TimeIconType;
  /** ドロップダウン内に duration を表示するか（minTime からの経過時間） */
  showDurationInMenu?: boolean;
}

/**
 * 時刻選択Combobox（Google Calendar風）
 * - クリック → 15分刻みのドロップダウン
 * - 直接入力も可能（スマートパース対応）
 */
/**
 * 時間差を「Xh Xm」形式でフォーマット
 */
function formatDuration(startTime: string, endTime: string): string {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = (startH ?? 0) * 60 + (startM ?? 0);
  const endMinutes = (endH ?? 0) * 60 + (endM ?? 0);
  const diff = endMinutes - startMinutes;
  if (diff <= 0) return '';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function TimeSelect({
  value,
  onChange,
  label,
  disabled = false,
  minTime,
  hasError = false,
  showIcon = false,
  iconType = 'clock',
  showDurationInMenu = false,
}: TimeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [error, setError] = useState<string>('');
  const [skipFilter, setSkipFilter] = useState(false);
  const hasScrolledRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const timeOptions = useMemo(() => generateTimeOptions(), []);

  // minTime でフィルタリング（開始時刻以降のみ）
  const availableOptions = minTime
    ? timeOptions.filter((option) => {
        const [optionHour, optionMinute] = option.split(':').map(Number);
        const [minHour, minMinute] = minTime.split(':').map(Number);
        const optionMinutes = optionHour! * 60 + optionMinute!;
        const minMinutes = minHour! * 60 + minMinute!;
        return optionMinutes > minMinutes; // 開始時刻より後のみ
      })
    : timeOptions;

  // 入力値でフィルタリングされた時刻オプション
  const filteredOptions = availableOptions.filter((option) => {
    if (skipFilter) return true; // フォーカス直後はフィルタリングをスキップ
    if (!inputValue) return true;
    const cleanInput = inputValue.replace(/[^\d:]/g, '');
    if (!cleanInput) return true;
    return option.includes(cleanInput);
  });

  // value が変更されたら inputValue も更新
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // エラー時は入力値を元に戻す
  useEffect(() => {
    if (hasError) {
      setInputValue(value);
    }
  }, [hasError, value]);

  // Popover が閉じたときに入力値をパース
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && inputValue !== value) {
      const parsed = parseTimeInput(inputValue);
      onChange(parsed);
    }
  };

  // ドロップダウンを開いた時のスクロール位置（初回のみ）
  // - minTime あり: 一番上から表示（終了時刻選択用）
  // - minTime なし: 選択中の時刻または現在時刻を中央に表示
  useEffect(() => {
    if (isOpen && !hasScrolledRef.current) {
      // DOM が準備できてからスクロール
      requestAnimationFrame(() => {
        if (!listRef.current) return;

        // minTime が設定されている場合: 一番上から表示
        if (minTime) {
          listRef.current.scrollTop = 0;
          hasScrolledRef.current = true;
          return;
        }

        let targetIndex = -1;

        if (value) {
          // 値が設定されている場合: その値を中央に表示（全オプションから検索）
          targetIndex = timeOptions.indexOf(value);

          // 15分刻みではない時刻の場合、最も近い15分刻みの時刻を探す
          if (targetIndex === -1) {
            const [hours, minutes] = value.split(':').map(Number);
            if (!isNaN(hours!) && !isNaN(minutes!)) {
              // 15分刻みに丸める
              const roundedMinutes = Math.floor(minutes! / 15) * 15;
              const roundedTimeStr = `${hours!.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
              targetIndex = timeOptions.indexOf(roundedTimeStr);
            }
          }
        } else {
          // 値が空の場合: 現在時刻に最も近い時刻を中央に表示
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          const roundedMinutes = Math.floor(currentMinute / 15) * 15;
          const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
          targetIndex = timeOptions.indexOf(currentTimeStr);
        }

        if (targetIndex !== -1) {
          const itemHeight = 32; // py-2 = 6px*2 + text height ≈ 32px
          const containerHeight = 200; // max-h-52
          // 選択された項目を中央に配置
          listRef.current.scrollTop =
            targetIndex * itemHeight - containerHeight / 2 + itemHeight / 2;
          hasScrolledRef.current = true;
        }
      });
    }
    // ドロップダウンを閉じたらフラグをリセット
    if (!isOpen) {
      hasScrolledRef.current = false;
    }
  }, [isOpen, value, timeOptions, minTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1); // 入力時はハイライトをリセット
    setError(''); // 入力中はエラーをクリア
    setSkipFilter(false); // 入力が始まったらフィルタリングを有効化

    // ドロップダウンを開く（フィルタリングのため）
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Popoverが開いている場合はPopover側で処理するのでスキップ
    // （blur → popover close の順で発火するため重複を防ぐ）
    if (isOpen) return;

    // フォーカスが外れたら入力値をパース
    const parsed = parseTimeInput(inputValue);

    // minTime バリデーション
    if (parsed && minTime) {
      const [parsedHour, parsedMinute] = parsed.split(':').map(Number);
      const [minHour, minMinute] = minTime.split(':').map(Number);
      const parsedMinutes = parsedHour! * 60 + parsedMinute!;
      const minMinutes = minHour! * 60 + minMinute!;

      if (parsedMinutes <= minMinutes) {
        setError(`開始時刻（${minTime}）より後の時刻を入力してください`);
        return;
      }
    }

    if (parsed !== inputValue) {
      onChange(parsed);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        // ハイライトされた選択肢を確定
        const selected = filteredOptions[highlightedIndex]!;
        onChange(selected);
        setInputValue(selected);
      } else {
        // 入力値をパース
        const parsed = parseTimeInput(inputValue);

        // minTime バリデーション
        if (parsed && minTime) {
          const [parsedHour, parsedMinute] = parsed.split(':').map(Number);
          const [minHour, minMinute] = minTime.split(':').map(Number);
          const parsedMinutes = parsedHour! * 60 + parsedMinute!;
          const minMinutes = minHour! * 60 + minMinute!;

          if (parsedMinutes <= minMinutes) {
            setError(`開始時刻（${minTime}）より後の時刻を入力してください`);
            return;
          }
        }

        onChange(parsed);
      }
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        // ドロップダウンが閉じている場合: 15分減算
        if (value) {
          const [hour, minute] = value.split(':').map(Number);
          let totalMinutes = hour! * 60 + minute! - 15;
          if (totalMinutes < 0) totalMinutes += 24 * 60; // 0時を下回ったら23:45に
          const newHour = Math.floor(totalMinutes / 60) % 24;
          const newMinute = totalMinutes % 60;
          const newTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
          onChange(newTime);
        }
      } else {
        setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        // ドロップダウンが閉じている場合: 15分加算
        if (value) {
          const [hour, minute] = value.split(':').map(Number);
          let totalMinutes = hour! * 60 + minute! + 15;
          if (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60; // 24:00を超えたら0:00に
          const newHour = Math.floor(totalMinutes / 60) % 24;
          const newMinute = totalMinutes % 60;
          const newTime = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
          onChange(newTime);
        }
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Tab') {
      // Tabキーで次のフィールドに移動する前にパース
      const parsed = parseTimeInput(inputValue);
      if (parsed !== inputValue) {
        onChange(parsed);
      }
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleInputFocus = () => {
    // フォーカス時に全選択（ユーザーが新しい値を入力しやすくする）
    if (inputRef.current) {
      inputRef.current.select();
    }
    setSkipFilter(true); // フォーカス時はフィルタリングをスキップ
    setIsOpen(true);
  };

  const handleOptionClick = (option: string) => {
    onChange(option);
    setInputValue(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setSkipFilter(false); // 選択後はフィルタリングを有効化
  };

  return (
    <div className={label ? 'space-y-1' : ''}>
      {label && <label className="text-muted-foreground text-xs">{label}</label>}
      <Popover open={isOpen} onOpenChange={handleOpenChange} modal={false}>
        <PopoverAnchor asChild>
          <div
            className={`relative flex cursor-text items-center rounded-lg transition-colors ${
              hasError ? 'ring-destructive ring-2' : 'hover:bg-state-hover'
            } ${showIcon ? 'w-[72px] gap-2 px-2' : ''}`}
            onClick={() => {
              if (!isOpen) setIsOpen(true);
              inputRef.current?.focus();
            }}
          >
            {showIcon &&
              (iconType === 'flag' ? (
                <Flag className="text-muted-foreground size-4 shrink-0" />
              ) : (
                <Clock className="text-muted-foreground size-4 shrink-0" />
              ))}
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              enterKeyHint="done"
              role="combobox"
              aria-expanded={isOpen}
              aria-controls="time-listbox"
              aria-autocomplete="list"
              aria-invalid={hasError || !!error}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              onFocus={handleInputFocus}
              disabled={disabled}
              placeholder="--:--"
              className={`flex h-8 rounded-lg bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                showIcon ? 'w-auto' : 'w-14 px-2 text-center'
              } ${value ? 'text-foreground' : 'text-muted-foreground'} ${error || hasError ? 'text-destructive' : ''}`}
            />
            {error && (
              <div className="text-destructive absolute top-full left-0 mt-1 text-xs whitespace-nowrap">
                {error}
              </div>
            )}
          </div>
        </PopoverAnchor>

        {!disabled && filteredOptions.length > 0 && (
          <PopoverContent
            className="overflow-hidden p-0"
            align="start"
            sideOffset={4}
            style={{
              width: showDurationInMenu && minTime ? '140px' : '80px',
              zIndex: zIndex.overlayDropdown,
            }}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div
              id="time-listbox"
              ref={listRef}
              role="listbox"
              className="scrollbar-thin max-h-52 overflow-y-auto overscroll-contain p-2"
              style={{
                scrollbarColor:
                  'color-mix(in oklch, var(--color-muted-foreground) 30%, transparent) transparent',
                touchAction: 'pan-y',
                scrollSnapType: 'y mandatory',
              }}
            >
              {filteredOptions.map((option, index) => (
                <button
                  key={option}
                  role="option"
                  aria-selected={option === value}
                  type="button"
                  className={`hover:bg-state-hover w-full rounded px-2 py-1 text-left text-sm ${
                    index === highlightedIndex
                      ? 'bg-state-selected'
                      : option === value
                        ? 'bg-state-hover'
                        : ''
                  }`}
                  style={{ scrollSnapAlign: 'center' }}
                  onClick={() => handleOptionClick(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {showDurationInMenu && minTime ? (
                    <span className="flex items-center gap-2">
                      <span className="tabular-nums">{option}</span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {formatDuration(minTime, option)}
                      </span>
                    </span>
                  ) : (
                    <span className="tabular-nums">{option}</span>
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}
