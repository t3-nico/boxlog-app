'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useUpdateTag } from '@/features/tags/hooks/useTags';

interface UseFilterItemEditProps {
  tagId: string | undefined;
  initialName: string;
  initialDescription: string | null | undefined;
  initialColor: string | undefined;
}

interface UseFilterItemEditReturn {
  // State
  isEditing: boolean;
  editName: string;
  editDescription: string;
  optimisticColor: string | null;
  displayColor: string;

  // Refs
  inputRef: React.RefObject<HTMLInputElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;

  // Name editing
  setEditName: (name: string) => void;
  handleStartRename: () => void;
  handleSaveName: () => Promise<void>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  cancelEditing: () => void;

  // Description editing
  setEditDescription: (description: string) => void;
  handleSaveDescription: () => Promise<void>;

  // Color editing
  handleColorChange: (color: string) => Promise<void>;
}

export function useFilterItemEdit({
  tagId,
  initialName,
  initialDescription,
  initialColor,
}: UseFilterItemEditProps): UseFilterItemEditReturn {
  const updateTagMutation = useUpdateTag();

  // Name editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Description editing state
  const [editDescription, setEditDescription] = useState(initialDescription ?? '');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Color optimistic update state
  const [optimisticColor, setOptimisticColor] = useState<string | null>(null);
  const displayColor = optimisticColor ?? initialColor ?? '#3B82F6';

  // Sync description when prop changes
  useEffect(() => {
    setEditDescription(initialDescription ?? '');
  }, [initialDescription]);

  // Focus input when editing starts
  useEffect(() => {
    if (!isEditing) return;
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(0, 0);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [isEditing]);

  // Clear optimistic color when server color matches
  useEffect(() => {
    if (initialColor && optimisticColor && initialColor === optimisticColor) {
      setOptimisticColor(null);
    }
  }, [initialColor, optimisticColor]);

  // Start rename
  const handleStartRename = useCallback(() => {
    setEditName(initialName);
    setIsEditing(true);
  }, [initialName]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Save name
  const handleSaveName = useCallback(async () => {
    if (!tagId || !editName.trim()) {
      setIsEditing(false);
      return;
    }
    if (editName.trim() === initialName) {
      setIsEditing(false);
      return;
    }
    await updateTagMutation.mutateAsync({
      id: tagId,
      data: { name: editName.trim() },
    });
    setIsEditing(false);
  }, [tagId, editName, initialName, updateTagMutation]);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveName();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
    },
    [handleSaveName],
  );

  // Color change with optimistic update
  const handleColorChange = useCallback(
    async (color: string) => {
      if (!tagId) return;
      setOptimisticColor(color);
      try {
        await updateTagMutation.mutateAsync({
          id: tagId,
          data: { color },
        });
      } catch {
        setOptimisticColor(null);
      }
    },
    [tagId, updateTagMutation],
  );

  // Save description
  const handleSaveDescription = useCallback(async () => {
    if (!tagId) return;
    const trimmed = editDescription.trim();
    if (trimmed === (initialDescription ?? '')) return;
    await updateTagMutation.mutateAsync({
      id: tagId,
      data: { description: trimmed || null },
    });
  }, [tagId, editDescription, initialDescription, updateTagMutation]);

  return {
    // State
    isEditing,
    editName,
    editDescription,
    optimisticColor,
    displayColor,

    // Refs
    inputRef,
    textareaRef,

    // Name editing
    setEditName,
    handleStartRename,
    handleSaveName,
    handleKeyDown,
    cancelEditing,

    // Description editing
    setEditDescription,
    handleSaveDescription,

    // Color editing
    handleColorChange,
  };
}
