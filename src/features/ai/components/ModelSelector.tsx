'use client';

/**
 * ModelSelector - AIモデル選択Popover
 *
 * 入力エリア左下に配置。現在のプロバイダーで利用可能なモデルを
 * Popoverで一覧表示し、選択を切り替える。
 */

import { Check, ChevronDown } from 'lucide-react';
import { memo, useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import type { ModelInfo } from '@/server/services/ai/types';

interface ModelSelectorProps {
  models: ModelInfo[];
  selectedModelId: string | null;
  defaultModelId: string;
  onSelect: (modelId: string | null) => void;
  disabled?: boolean;
}

export const ModelSelector = memo(function ModelSelector({
  models,
  selectedModelId,
  defaultModelId,
  onSelect,
  disabled = false,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  const activeModelId = selectedModelId ?? defaultModelId;
  const activeModel = models.find((m) => m.id === activeModelId);

  const handleSelect = useCallback(
    (modelId: string) => {
      // デフォルトモデルを選択した場合は null に戻す
      onSelect(modelId === defaultModelId ? null : modelId);
      setOpen(false);
    },
    [onSelect, defaultModelId],
  );

  if (models.length <= 1) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="text-muted-foreground hover:text-foreground h-7 gap-0.5 px-2 text-xs font-normal"
        >
          <span className="max-w-[120px] truncate">{activeModel?.name ?? 'Model'}</span>
          <ChevronDown className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-56 p-1">
        <div className="max-h-64 overflow-y-auto">
          {models.map((model) => (
            <button
              key={model.id}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors',
                'hover:bg-state-hover',
                model.id === activeModelId && 'bg-state-selected',
              )}
              onClick={() => handleSelect(model.id)}
            >
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-xs font-medium">{model.name}</p>
                <p className="text-muted-foreground text-[10px]">{model.description}</p>
              </div>
              {model.id === activeModelId && (
                <Check className="text-foreground size-3.5 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
});
