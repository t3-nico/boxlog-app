'use client';

import { useCallback, useMemo, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  checkBrowserNotificationSupport,
  requestNotificationPermission,
} from '@/features/notifications/utils/notification-helpers';
import { api } from '@/lib/trpc';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { SettingRow } from './fields/SettingRow';
import { SettingsCard } from './SettingsCard';

// 配信方法の型
type DeliveryMethod = 'browser' | 'email' | 'push';

// 通知タイプの型
type NotificationType = 'reminders' | 'plan_updates' | 'system';

// 配信設定の型
type DeliverySettings = Record<NotificationType, DeliveryMethod[]>;

// デフォルトの配信設定
const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  reminders: ['browser'],
  plan_updates: ['browser'],
  system: ['browser'],
};

// 通知タイプの設定
const NOTIFICATION_TYPES: {
  type: NotificationType;
  labelKey: string;
}[] = [
  { type: 'reminders', labelKey: 'notification.settings.types.reminders.label' },
  { type: 'plan_updates', labelKey: 'notification.settings.types.plan_updates.label' },
  { type: 'system', labelKey: 'notification.settings.types.system.label' },
];

// 配信方法の設定
const DELIVERY_METHODS: {
  method: DeliveryMethod;
  labelKey: string;
  disabled: boolean;
}[] = [
  { method: 'browser', labelKey: 'notification.settings.methods.browser', disabled: false },
  { method: 'push', labelKey: 'notification.settings.methods.push', disabled: true },
  { method: 'email', labelKey: 'notification.settings.methods.email', disabled: true },
];

interface DeliveryMethodDropdownProps {
  selectedMethods: DeliveryMethod[];
  onMethodsChange: (methods: DeliveryMethod[]) => void;
  isPending: boolean;
  browserPermission: NotificationPermission | null;
}

function DeliveryMethodDropdown({
  selectedMethods,
  onMethodsChange,
  isPending,
  browserPermission,
}: DeliveryMethodDropdownProps) {
  const t = useTranslations();

  // 選択中の配信方法のラベルを生成
  const getSelectedLabel = () => {
    if (selectedMethods.length === 0) {
      return t('notification.settings.methods.none');
    }

    return selectedMethods
      .map((method) => {
        const config = DELIVERY_METHODS.find((m) => m.method === method);
        return config ? t(config.labelKey) : method;
      })
      .join(', ');
  };

  // 配信方法のトグル
  const handleMethodToggle = async (method: DeliveryMethod) => {
    // ブラウザ通知を有効にする場合は許可をリクエスト
    if (method === 'browser' && !selectedMethods.includes('browser')) {
      if (checkBrowserNotificationSupport()) {
        const permission = await requestNotificationPermission();
        if (permission !== 'granted') {
          toast.error(t('notification.settings.browserPermissionDenied'));
          return;
        }
      }
    }

    const newMethods = selectedMethods.includes(method)
      ? selectedMethods.filter((m) => m !== method)
      : [...selectedMethods, method];

    onMethodsChange(newMethods);
  };

  const isBrowserPermissionDenied = browserPermission === 'denied';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2" disabled={isPending}>
          <span className="text-sm">{getSelectedLabel()}</span>
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {DELIVERY_METHODS.map(({ method, labelKey, disabled }) => {
          const isDisabledByPermission = method === 'browser' && isBrowserPermissionDenied;
          const isChecked = selectedMethods.includes(method);

          return (
            <DropdownMenuCheckboxItem
              key={method}
              checked={isChecked}
              onCheckedChange={() => handleMethodToggle(method)}
              disabled={disabled || isDisabledByPermission}
              className="flex items-center gap-2"
            >
              {t(labelKey)}
              {disabled && (
                <span className="text-muted-foreground ml-auto text-xs">
                  {t('notification.settings.comingSoon')}
                </span>
              )}
              {isDisabledByPermission && (
                <span className="text-destructive ml-auto text-xs">
                  {t('notification.settings.permissionDenied')}
                </span>
              )}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NotificationSettings() {
  const t = useTranslations();
  const utils = api.useUtils();

  // 通知設定を取得
  const { data: preferences, isLoading } = api.notificationPreferences.get.useQuery();

  // サーバーデータから設定を導出（useEffect同期不要）
  const serverSettings = useMemo<DeliverySettings>(
    () => (preferences?.deliverySettings as DeliverySettings) ?? DEFAULT_DELIVERY_SETTINGS,
    [preferences],
  );

  // 楽観的更新用: mutation中のみ変更を保持
  const [pendingChanges, setPendingChanges] = useState<Partial<DeliverySettings>>({});

  // 表示用設定: サーバーデータ + 楽観的変更をマージ
  const displaySettings = useMemo<DeliverySettings>(
    () => ({ ...serverSettings, ...pendingChanges }),
    [serverSettings, pendingChanges],
  );

  // ブラウザ通知許可状態（同期的に読み取り、useEffect不要）
  const [browserPermission] = useState<NotificationPermission | null>(() => {
    if (typeof window === 'undefined') return null;
    return checkBrowserNotificationSupport() ? Notification.permission : null;
  });

  // 配信設定を更新
  const updateMutation = api.notificationPreferences.updateDeliverySettings.useMutation({
    onSuccess: () => {
      utils.notificationPreferences.get.invalidate();
    },
    onSettled: () => {
      setPendingChanges({});
    },
    onError: (error) => {
      toast.error(t('notification.settings.saveError', { message: error.message }));
    },
  });

  // 配信方法の変更ハンドラー
  const handleMethodsChange = useCallback(
    (type: NotificationType, methods: DeliveryMethod[]) => {
      // 楽観的に変更を記録
      setPendingChanges((prev) => ({ ...prev, [type]: methods }));

      // サーバーに保存
      updateMutation.mutate({
        notificationType: type,
        deliveryMethods: methods,
      });
    },
    [updateMutation],
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <SettingsCard>
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SettingsCard isSaving={updateMutation.isPending}>
        <div className="space-y-0">
          {NOTIFICATION_TYPES.map(({ type, labelKey }) => (
            <SettingRow key={type} label={t(labelKey)}>
              <DeliveryMethodDropdown
                selectedMethods={displaySettings[type] ?? []}
                onMethodsChange={(methods) => handleMethodsChange(type, methods)}
                isPending={updateMutation.isPending}
                browserPermission={browserPermission}
              />
            </SettingRow>
          ))}
        </div>
      </SettingsCard>

      {/* ヒント情報 */}
      <div className="bg-card border-border rounded-lg border p-4">
        <p className="text-muted-foreground text-sm">{t('notification.settings.tip')}</p>
      </div>
    </div>
  );
}
