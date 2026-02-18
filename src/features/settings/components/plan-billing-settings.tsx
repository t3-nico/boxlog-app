'use client';

import { memo, useCallback, useState } from 'react';

import { Check, CreditCard, Crown, Receipt, Sparkles, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { SettingsCard } from './SettingsCard';

interface Plan {
  id: string;
  nameKey: string;
  price: number;
  period: 'month' | 'year';
  featureKeys: string[];
  recommended?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    nameKey: 'settings.subscription.plans.free.name',
    price: 0,
    period: 'month',
    featureKeys: [
      'settings.subscription.plans.free.features.basicTasks',
      'settings.subscription.plans.free.features.maxTasks',
      'settings.subscription.plans.free.features.tags',
      'settings.subscription.plans.free.features.calendar',
    ],
  },
  {
    id: 'pro',
    nameKey: 'settings.subscription.plans.pro.name',
    price: 980,
    period: 'month',
    featureKeys: [
      'settings.subscription.plans.pro.features.unlimitedTasks',
      'settings.subscription.plans.pro.features.unlimitedTags',
      'settings.subscription.plans.pro.features.integrations',
      'settings.subscription.plans.pro.features.prioritySupport',
      'settings.subscription.plans.pro.features.advancedAnalytics',
    ],
    recommended: true,
  },
  {
    id: 'team',
    nameKey: 'settings.subscription.plans.team.name',
    price: 2980,
    period: 'month',
    featureKeys: [
      'settings.subscription.plans.team.features.allPro',
      'settings.subscription.plans.team.features.teamSharing',
      'settings.subscription.plans.team.features.adminDashboard',
      'settings.subscription.plans.team.features.sso',
      'settings.subscription.plans.team.features.dedicatedSupport',
    ],
  },
];

export const PlanBillingSettings = memo(function PlanBillingSettings() {
  const t = useTranslations();
  const [currentPlan] = useState('free');
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');

  const handlePeriodChange = useCallback((period: 'month' | 'year') => {
    setBillingPeriod(period);
  }, []);

  return (
    <div className="space-y-8">
      {/* 現在のプラン */}
      <SettingsCard title={t('settings.subscription.currentPlan')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-state-active flex h-12 w-12 items-center justify-center rounded-2xl">
              <Zap className="text-primary h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold">{t('settings.subscription.freePlanLabel')}</h4>
                <Badge variant="secondary">{t('settings.subscription.currentBadge')}</Badge>
              </div>
              <p className="text-muted-foreground text-sm">
                {t('settings.subscription.freePlanDescription')}
              </p>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* プラン選択 */}
      <SettingsCard
        title={t('settings.subscription.selectPlan')}
        actions={
          <div className="bg-container flex gap-1 rounded-2xl p-1">
            <Button
              variant={billingPeriod === 'month' ? 'primary' : 'ghost'}
              onClick={() => handlePeriodChange('month')}
            >
              {t('settings.subscription.monthly')}
            </Button>
            <Button
              variant={billingPeriod === 'year' ? 'primary' : 'ghost'}
              onClick={() => handlePeriodChange('year')}
            >
              {t('settings.subscription.yearly')}
              <Badge variant="secondary" className="ml-2">
                {t('settings.subscription.yearlyDiscount')}
              </Badge>
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'border-border relative rounded-2xl border p-4',
                plan.recommended && 'border-primary ring-primary/20 ring-2',
                currentPlan === plan.id && 'bg-container',
              )}
            >
              {plan.recommended && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <Sparkles className="mr-1 h-3 w-3" />
                  {t('settings.subscription.recommended')}
                </Badge>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  {plan.id === 'team' && <Crown className="text-primary h-4 w-4" />}
                  <h4 className="font-bold">{t(plan.nameKey)}</h4>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold">
                    ¥{billingPeriod === 'year' ? Math.floor(plan.price * 0.8) : plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {t('settings.subscription.perMonth')}
                  </span>
                </div>
              </div>

              <ul className="mb-4 space-y-2">
                {plan.featureKeys.map((featureKey) => (
                  <li key={featureKey} className="flex items-center gap-2 text-sm">
                    <Check className="text-primary h-4 w-4 flex-shrink-0" />
                    <span>{t(featureKey)}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={currentPlan === plan.id ? 'ghost' : plan.recommended ? 'primary' : 'ghost'}
                disabled
              >
                {currentPlan === plan.id
                  ? t('settings.subscription.inUse')
                  : t('settings.subscription.upgrade')}
              </Button>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* 支払い方法 */}
      <SettingsCard title={t('settings.subscription.paymentMethod')}>
        <div className="space-y-4">
          <div className="border-border flex items-center justify-between rounded-2xl border p-4">
            <div className="flex items-center gap-4">
              <div className="bg-container flex h-10 w-10 items-center justify-center rounded-2xl">
                <CreditCard className="text-muted-foreground h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">{t('settings.subscription.noCard')}</p>
              </div>
            </div>
            <Button variant="ghost" disabled>
              {t('settings.subscription.addCard')}
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            {t('settings.subscription.paymentComingSoon')}
          </p>
        </div>
      </SettingsCard>

      {/* 請求履歴 */}
      <SettingsCard title={t('settings.subscription.billingHistory')}>
        <div className="space-y-4">
          <div className="flex h-32 flex-col items-center justify-center">
            <Receipt className="text-muted-foreground mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              {t('settings.subscription.noBillingHistory')}
            </p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
});
