/**
 * タグコンテナ - 横幅に応じて表示できるだけタグを表示し、隠れたタグは+Nで表示
 * IntersectionObserverを使用して可視タグ数を検出
 */

'use client';

import { memo, useEffect, useRef, useState } from 'react';

interface Tag {
  id: string;
  name: string;
  color: string;
  icon?: string | undefined;
  parent_id?: string | undefined;
}

interface TagsContainerProps {
  tags: Tag[];
}

export const TagsContainer = memo<TagsContainerProps>(function TagsContainer({ tags }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || tags.length === 0) return;

    // タグ要素を取得（+N要素を除く）
    const tagElements = container.querySelectorAll('[data-tag]');
    if (tagElements.length === 0) return;

    // 各タグの可視状態を追跡
    const visibilityMap = new Map<Element, boolean>();
    tagElements.forEach((el) => visibilityMap.set(el, true));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibilityMap.set(entry.target, entry.isIntersecting);
        });

        // 可視タグ数をカウント
        let visible = 0;
        visibilityMap.forEach((isVisible) => {
          if (isVisible) visible++;
        });
        setVisibleCount(visible);
      },
      {
        root: container,
        threshold: 0.5, // 50%以上見えていれば可視とみなす
      },
    );

    tagElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [tags]);

  const hiddenCount = tags.length - visibleCount;

  if (tags.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="flex min-h-0 flex-shrink flex-wrap gap-1 overflow-hidden pt-1"
    >
      {tags.map((tag) => (
        <span
          key={tag.id}
          data-tag
          className="inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs leading-tight"
          style={{ borderColor: tag.color || undefined }}
          title={tag.name}
        >
          {tag.name}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className="inline-flex items-center px-1 text-xs opacity-75">+{hiddenCount}</span>
      )}
    </div>
  );
});
