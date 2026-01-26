import { LoadingSpinner } from '@/components/common/Loading/LoadingStates';

/**
 * Record ページのローディング状態
 */
export default function RecordLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground text-sm">読み込み中...</p>
      </div>
    </div>
  );
}
