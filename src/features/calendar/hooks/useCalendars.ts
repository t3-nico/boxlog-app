import { useState } from 'react';

// ========================================
// Local State Hooks（ローカル状態管理）
// ========================================

export function useCalendarSelection(initialCalendarIds: string[] = []) {
  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>(initialCalendarIds);

  const toggleCalendar = (calendarId: string) => {
    setSelectedCalendarIds((prev) =>
      prev.includes(calendarId) ? prev.filter((id) => id !== calendarId) : [...prev, calendarId],
    );
  };

  const selectAll = (calendarIds: string[]) => {
    setSelectedCalendarIds(calendarIds);
  };

  const deselectAll = () => {
    setSelectedCalendarIds([]);
  };

  const isSelected = (calendarId: string) => {
    return selectedCalendarIds.includes(calendarId);
  };

  return {
    selectedCalendarIds,
    toggleCalendar,
    selectAll,
    deselectAll,
    isSelected,
    setSelectedCalendarIds,
  };
}

export function useCalendarColors() {
  const defaultColors = [
    '#3b82f6', // blue-500
    '#ef4444', // red-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
    '#6366f1', // indigo-500
  ];

  const [customColors, setCustomColors] = useState<string[]>([]);

  const addCustomColor = (color: string) => {
    if (!customColors.includes(color)) {
      setCustomColors((prev) => [...prev, color]);
    }
  };

  const removeCustomColor = (color: string) => {
    setCustomColors((prev) => prev.filter((c) => c !== color));
  };

  const allColors = [...defaultColors, ...customColors];

  return {
    defaultColors,
    customColors,
    allColors,
    addCustomColor,
    removeCustomColor,
  };
}
