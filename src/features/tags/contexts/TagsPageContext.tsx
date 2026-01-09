'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

import type { Tag } from '@/features/tags/types';

interface TagsPageContextValue {
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isCreatingGroup: boolean;
  setIsCreatingGroup: (creating: boolean) => void;
  isCreatingTag: boolean;
  setIsCreatingTag: (creating: boolean) => void;
}

const TagsPageContext = createContext<TagsPageContextValue | null>(null);

export function useTagsPageContext() {
  const context = useContext(TagsPageContext);
  if (!context) {
    throw new Error('useTagsPageContext must be used within TagsPageProvider');
  }
  return context;
}

interface TagsPageProviderProps {
  children: ReactNode;
}

export function TagsPageProvider({ children }: TagsPageProviderProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  return (
    <TagsPageContext.Provider
      value={{
        tags,
        setTags,
        isLoading,
        setIsLoading,
        isCreatingGroup,
        setIsCreatingGroup,
        isCreatingTag,
        setIsCreatingTag,
      }}
    >
      {children}
    </TagsPageContext.Provider>
  );
}
