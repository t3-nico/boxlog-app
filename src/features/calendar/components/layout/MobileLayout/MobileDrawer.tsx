'use client';

import { useEffect, useRef } from 'react';

import Image from 'next/image';

import { Bell, Calendar, Download, Palette, Settings, Upload, User, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export type DrawerMenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  badge?: number;
  disabled?: boolean;
  divider?: boolean;
};

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  items?: DrawerMenuItem[];
  userInfo?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  className?: string;
}

/**
 * モバイル用ドロワーメニュー
 * 左側からスライドインするサイドメニュー
 */
export const MobileDrawer = ({
  isOpen,
  onClose,
  title,
  items,
  userInfo,
  className,
}: MobileDrawerProps) => {
  const t = useTranslations();
  const drawerRef = useRef<HTMLDivElement>(null);

  const defaultMenuItems: DrawerMenuItem[] = [
    {
      id: 'calendar',
      label: t('calendar.mobile.drawer.calendar'),
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: 'settings',
      label: t('calendar.mobile.drawer.settings'),
      icon: <Settings className="h-5 w-5" />,
    },
    {
      id: 'notifications',
      label: t('calendar.mobile.drawer.notifications'),
      icon: <Bell className="h-5 w-5" />,
      badge: 3,
    },
    {
      id: 'theme',
      label: t('settings.preferences.title'),
      icon: <Palette className="h-5 w-5" />,
    },
    {
      id: 'divider1',
      label: '',
      icon: null,
      divider: true,
    },
    {
      id: 'export',
      label: t('settings.dataExport.title'),
      icon: <Download className="h-5 w-5" />,
    },
    {
      id: 'import',
      label: t('common.actions.create'),
      icon: <Upload className="h-5 w-5" />,
    },
  ];

  const menuItems = items ?? defaultMenuItems;
  const menuTitle = title ?? t('navigation.settings');

  // ESCキーでクローズ
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // スクロールを防止
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // フォーカストラップ
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTabKey);
    }
    return undefined;
  }, [isOpen]);

  const handleItemClick = (item: DrawerMenuItem) => {
    if (item.disabled || item.divider) return;
    item.onClick?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="bg-overlay fixed inset-0 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ドロワー */}
      <div
        ref={drawerRef}
        className={cn(
          'fixed top-0 left-0 h-full w-72 max-w-[80vw]',
          'bg-background border-border z-50 border-r shadow-xl',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className,
        )}
        role="dialog"
        aria-modal="true"
        aria-label={menuTitle}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-bold">{menuTitle}</h2>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-state-hover -mr-2 rounded-full p-2 transition-colors"
            aria-label={t('calendar.mobile.drawer.closeMenu')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ユーザー情報 */}
        {userInfo != null && (
          <div className="p-4">
            <div className="flex items-center gap-4">
              {userInfo.avatar ? (
                <Image
                  src={userInfo.avatar}
                  alt={userInfo.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                  sizes="40px"
                />
              ) : (
                <div className="bg-state-active flex h-10 w-10 items-center justify-center rounded-full">
                  <User className="text-primary h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-normal">{userInfo.name}</div>
                {userInfo.email != null && (
                  <div className="text-muted-foreground truncate text-sm">{userInfo.email}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* メニューアイテム */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            {menuItems.map((item) => {
              if (item.divider) {
                return <div key={item.id} className="border-border my-2 border-t" />;
              }

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={cn(
                    'flex w-full items-center gap-4 px-4 py-4 text-left',
                    'hover:bg-state-hover transition-colors',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  {/* アイコン */}
                  <div className="flex-shrink-0">{item.icon}</div>

                  {/* ラベル */}
                  <span className="flex-1 text-sm font-normal">{item.label}</span>

                  {/* バッジ */}
                  {item.badge && item.badge > 0 ? (
                    <div className="bg-primary text-primary-foreground flex h-5 min-w-5 items-center justify-center rounded-full px-2 text-xs">
                      {item.badge > 99 ? '99+' : item.badge}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
