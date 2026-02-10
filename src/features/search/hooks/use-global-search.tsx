'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { GlobalSearchModal } from '../components/global-search-modal';

interface GlobalSearchContextType {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const noop = () => {};
const fallback: GlobalSearchContextType = { open: noop, close: noop, isOpen: false };

const GlobalSearchContext = createContext<GlobalSearchContextType | null>(null);

/** Provider外ではnoop fallbackを返す（Storybook等で安全に動作） */
export function useGlobalSearch(): GlobalSearchContextType {
  return useContext(GlobalSearchContext) ?? fallback;
}

export const GlobalSearchProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  const contextValue = useMemo(
    () => ({
      open,
      close,
      isOpen,
    }),
    [open, close, isOpen],
  );

  return (
    <GlobalSearchContext.Provider value={contextValue}>
      {children}
      <GlobalSearchModal isOpen={isOpen} onClose={close} />
    </GlobalSearchContext.Provider>
  );
};
