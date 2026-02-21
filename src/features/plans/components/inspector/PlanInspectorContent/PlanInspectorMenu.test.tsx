import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

// Radix UIのDropdownMenuはContext必須のため、シンプルなモックに置き換え
vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenuItem: ({
    children,
    onClick,
    disabled,
    variant,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
  }) => (
    <div
      role="menuitem"
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      data-variant={variant}
    >
      {children}
    </div>
  ),
  DropdownMenuSeparator: () => <hr role="separator" />,
}));

import { PlanInspectorMenu } from './PlanInspectorMenu';

describe('PlanInspectorMenu', () => {
  const defaultProps = {
    onDuplicate: vi.fn(),
    onSaveAsTemplate: vi.fn(),
    onCopyId: vi.fn(),
    onDelete: vi.fn(),
  };

  function renderMenu(props = {}) {
    return render(
      <div role="menu">
        <PlanInspectorMenu {...defaultProps} {...props} />
      </div>,
    );
  }

  describe('メニュー項目のレンダリング', () => {
    it('複製メニュー項目が表示される', () => {
      renderMenu();
      expect(screen.getByText('plan.inspector.menu.duplicate')).toBeInTheDocument();
    });

    it('テンプレート保存メニュー項目が表示される', () => {
      renderMenu();
      expect(screen.getByText('plan.inspector.menu.saveAsTemplate')).toBeInTheDocument();
    });

    it('ID コピーメニュー項目が表示される', () => {
      renderMenu();
      expect(screen.getByText('plan.inspector.menu.copyId')).toBeInTheDocument();
    });

    it('削除メニュー項目が表示される', () => {
      renderMenu();
      expect(screen.getByText('common.actions.delete')).toBeInTheDocument();
    });

    it('Coming Soonラベルが表示される', () => {
      renderMenu();
      expect(screen.getByText('common.comingSoon')).toBeInTheDocument();
    });

    it('セパレーターが2つ表示される', () => {
      renderMenu();
      const separators = screen.getAllByRole('separator');
      expect(separators).toHaveLength(2);
    });

    it('テンプレート保存が無効化されている', () => {
      renderMenu();
      const items = screen.getAllByRole('menuitem');
      const templateItem = items.find((item) =>
        item.textContent?.includes('plan.inspector.menu.saveAsTemplate'),
      );
      expect(templateItem).toHaveAttribute('aria-disabled', 'true');
    });

    it('削除メニュー項目にdestructive variantが設定されている', () => {
      renderMenu();
      const items = screen.getAllByRole('menuitem');
      const deleteItem = items.find((item) => item.textContent?.includes('common.actions.delete'));
      expect(deleteItem).toHaveAttribute('data-variant', 'destructive');
    });
  });

  describe('クリックハンドラー', () => {
    it('複製クリックでonDuplicateが呼ばれる', () => {
      const onDuplicate = vi.fn();
      renderMenu({ onDuplicate });

      fireEvent.click(screen.getByText('plan.inspector.menu.duplicate'));
      expect(onDuplicate).toHaveBeenCalledTimes(1);
    });

    it('IDコピークリックでonCopyIdが呼ばれる', () => {
      const onCopyId = vi.fn();
      renderMenu({ onCopyId });

      fireEvent.click(screen.getByText('plan.inspector.menu.copyId'));
      expect(onCopyId).toHaveBeenCalledTimes(1);
    });

    it('削除クリックでonDeleteが呼ばれる', () => {
      const onDelete = vi.fn();
      renderMenu({ onDelete });

      fireEvent.click(screen.getByText('common.actions.delete'));
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });
});
