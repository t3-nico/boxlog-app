import { useCallback, useState } from 'react';

interface ClickedDateTime {
  date: Date;
  hour: number;
  minute: number;
}

/**
 * カレンダー空きエリアのコンテキストメニュー状態を管理するフック
 */
export const useEmptyAreaContextMenu = () => {
  const [emptyAreaMenuPosition, setEmptyAreaMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [clickedDateTime, setClickedDateTime] = useState<ClickedDateTime | null>(null);

  // 空きエリアの右クリックハンドラー
  const handleEmptyAreaContextMenu = useCallback(
    (date: Date, hour: number, minute: number, e: React.MouseEvent) => {
      setEmptyAreaMenuPosition({ x: e.clientX, y: e.clientY });
      setClickedDateTime({ date, hour, minute });
    },
    [],
  );

  // コンテキストメニューを閉じる
  const handleCloseEmptyAreaContextMenu = useCallback(() => {
    setEmptyAreaMenuPosition(null);
    setClickedDateTime(null);
  }, []);

  return {
    emptyAreaMenuPosition,
    clickedDateTime,
    handleEmptyAreaContextMenu,
    handleCloseEmptyAreaContextMenu,
  };
};
