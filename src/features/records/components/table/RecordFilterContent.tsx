'use client';

import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { useTags } from '@/features/tags/hooks';
import { Calendar, Clock, Pencil, RotateCcw, Smile, Tag, Timer } from 'lucide-react';

import {
  type DateRangeFilter,
  type DurationFilter,
  type FulfillmentFilter,
  type WorkedAtFilter,
  useRecordFilterStore,
} from '../../stores/useRecordFilterStore';

/**
 * 作業日フィルター選択肢
 */
const WORKED_AT_OPTIONS: Array<{ value: WorkedAtFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'yesterday', label: '昨日' },
  { value: 'this_week', label: '今週' },
  { value: 'last_week', label: '先週' },
  { value: 'this_month', label: '今月' },
];

/**
 * 充実度フィルター選択肢
 */
const FULFILLMENT_OPTIONS: Array<{ value: FulfillmentFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: '5', label: '★★★★★ (5)' },
  { value: '4', label: '★★★★☆ (4)' },
  { value: '3', label: '★★★☆☆ (3)' },
  { value: '2', label: '★★☆☆☆ (2)' },
  { value: '1', label: '★☆☆☆☆ (1)' },
  { value: 'unrated', label: '未評価' },
];

/**
 * 時間フィルター選択肢
 */
const DURATION_OPTIONS: Array<{ value: DurationFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'short', label: '30分未満' },
  { value: 'medium', label: '30分〜1時間' },
  { value: 'long', label: '1時間以上' },
];

/**
 * 日付範囲フィルター選択肢（作成日・更新日共通）
 */
const DATE_RANGE_OPTIONS: Array<{ value: DateRangeFilter; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'yesterday', label: '昨日' },
  { value: 'this_week', label: '今週' },
  { value: 'last_week', label: '先週' },
  { value: 'this_month', label: '今月' },
];

/**
 * Record フィルターコンテンツ
 */
export function RecordFilterContent() {
  const {
    workedAt,
    setWorkedAt,
    tags: selectedTags,
    setTags,
    fulfillment,
    setFulfillment,
    duration,
    setDuration,
    createdAt,
    setCreatedAt,
    updatedAt,
    setUpdatedAt,
    reset,
  } = useRecordFilterStore();
  const { data: allTags } = useTags();

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setTags([...selectedTags, tagId]);
    }
  };

  // フィルターがアクティブかどうか
  const hasActiveFilters =
    workedAt !== 'all' ||
    selectedTags.length > 0 ||
    fulfillment !== 'all' ||
    duration !== 'all' ||
    createdAt !== 'all' ||
    updatedAt !== 'all';

  return (
    <>
      <DropdownMenuGroup>
        {/* 作業日フィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Calendar />
            <span className="flex-1">作業日</span>
            {workedAt !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={workedAt}
              onValueChange={(v) => setWorkedAt(v as WorkedAtFilter)}
            >
              {WORKED_AT_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* タグフィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Tag />
            <span className="flex-1">タグ</span>
            {selectedTags.length > 0 && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                {selectedTags.length}
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            {allTags && allTags.length > 0 ? (
              allTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={selectedTags.includes(tag.id)}
                  onCheckedChange={() => handleTagToggle(tag.id)}
                >
                  {tag.name}
                </DropdownMenuCheckboxItem>
              ))
            ) : (
              <div className="text-muted-foreground px-2 py-2 text-sm">タグがありません</div>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 充実度フィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Smile />
            <span className="flex-1">充実度</span>
            {fulfillment !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={fulfillment}
              onValueChange={(v) => setFulfillment(v as FulfillmentFilter)}
            >
              {FULFILLMENT_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 時間フィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Timer />
            <span className="flex-1">時間</span>
            {duration !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={duration}
              onValueChange={(v) => setDuration(v as DurationFilter)}
            >
              {DURATION_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 作成日フィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Clock />
            <span className="flex-1">作成日</span>
            {createdAt !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={createdAt}
              onValueChange={(v) => setCreatedAt(v as DateRangeFilter)}
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 更新日フィルター */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Pencil />
            <span className="flex-1">更新日</span>
            {updatedAt !== 'all' && (
              <span className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full text-xs">
                1
              </span>
            )}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="border-input">
            <DropdownMenuRadioGroup
              value={updatedAt}
              onValueChange={(v) => setUpdatedAt(v as DateRangeFilter)}
            >
              {DATE_RANGE_OPTIONS.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuGroup>

      {/* リセットボタン（フィルターがアクティブな場合のみ表示） */}
      {hasActiveFilters && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={reset}>
            <RotateCcw />
            フィルターをリセット
          </DropdownMenuItem>
        </>
      )}
    </>
  );
}
