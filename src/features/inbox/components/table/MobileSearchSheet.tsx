'use client';

import { useState } from 'react';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { useInboxFilterStore } from '../../stores/useInboxFilterStore';

interface MobileSearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * モバイル用検索シート
 *
 * Notion風のアイコンナビゲーションから開く検索専用シート
 */
export function MobileSearchSheet({ open, onOpenChange }: MobileSearchSheetProps) {
  const { search, setSearch } = useInboxFilterStore();
  const [localSearch, setLocalSearch] = useState(search);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(localSearch);
    onOpenChange(false);
  };

  const handleClear = () => {
    setLocalSearch('');
    setSearch('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLocalSearch(search);
    }
    onOpenChange(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle>検索</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="タイトルで検索..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              autoFocus
              className="pr-10"
            />
            {localSearch && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="absolute top-1/2 right-1 size-8 -translate-y-1/2"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              キャンセル
            </Button>
            <Button type="submit" className="flex-1">
              検索
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
