'use client';

import { memo, useCallback, useState } from 'react';

import { Check, CreditCard, Crown, Receipt, Sparkles, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { SettingsCard } from './SettingsCard';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  features: string[];
  recommended?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    features: ['基本的なタスク管理', '最大100タスク', '3つのタグ', 'カレンダー表示'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 980,
    period: 'month',
    features: ['無制限のタスク', '無制限のタグ', '外部サービス連携', '優先サポート', '高度な分析'],
    recommended: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: 2980,
    period: 'month',
    features: ['Proの全機能', 'チーム共有', '管理者ダッシュボード', 'SSO対応', '専用サポート'],
  },
];

export const PlanBillingSettings = memo(function PlanBillingSettings() {
  const [currentPlan] = useState('free');
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('month');

  const handleUpgrade = useCallback((_planId: string) => {
    // Stub: アップグレード機能は未実装
  }, []);

  const handlePeriodChange = useCallback((period: 'month' | 'year') => {
    setBillingPeriod(period);
  }, []);

  return (
    <div className="space-y-8">
      {/* 現在のプラン */}
      <SettingsCard title="現在のプラン">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary-container flex h-12 w-12 items-center justify-center rounded-2xl">
              <Zap className="text-primary h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold">Free プラン</h4>
                <Badge variant="secondary">現在のプラン</Badge>
              </div>
              <p className="text-muted-foreground text-sm">基本機能をご利用いただけます</p>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* プラン選択 */}
      <SettingsCard
        title="プランを選択"
        actions={
          <div className="bg-surface-container flex gap-1 rounded-2xl p-1">
            <Button
              variant={billingPeriod === 'month' ? 'primary' : 'ghost'}
              onClick={() => handlePeriodChange('month')}
            >
              月払い
            </Button>
            <Button
              variant={billingPeriod === 'year' ? 'primary' : 'ghost'}
              onClick={() => handlePeriodChange('year')}
            >
              年払い
              <Badge variant="secondary" className="ml-2">
                20% OFF
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
                currentPlan === plan.id && 'bg-surface-container',
              )}
            >
              {plan.recommended && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <Sparkles className="mr-1 h-3 w-3" />
                  おすすめ
                </Badge>
              )}

              <div className="mb-4">
                <div className="flex items-center gap-2">
                  {plan.id === 'team' && <Crown className="text-primary h-4 w-4" />}
                  <h4 className="font-bold">{plan.name}</h4>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold">
                    ¥{billingPeriod === 'year' ? Math.floor(plan.price * 0.8) : plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">/月</span>
                </div>
              </div>

              <ul className="mb-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="text-primary h-4 w-4 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={
                  currentPlan === plan.id ? 'outline' : plan.recommended ? 'primary' : 'outline'
                }
                disabled={currentPlan === plan.id}
                onClick={() => handleUpgrade(plan.id)}
              >
                {currentPlan === plan.id ? '利用中' : 'アップグレード'}
              </Button>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* 支払い方法 */}
      <SettingsCard title="支払い方法">
        <div className="space-y-4">
          <div className="border-border flex items-center justify-between rounded-2xl border p-4">
            <div className="flex items-center gap-4">
              <div className="bg-surface-container flex h-10 w-10 items-center justify-center rounded-2xl">
                <CreditCard className="text-muted-foreground h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">カードが登録されていません</p>
              </div>
            </div>
            <Button variant="outline" disabled>
              カードを追加
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">※ 支払い機能は現在準備中です</p>
        </div>
      </SettingsCard>

      {/* 請求履歴 */}
      <SettingsCard title="請求履歴">
        <div className="space-y-4">
          <div className="flex h-32 flex-col items-center justify-center">
            <Receipt className="text-muted-foreground mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">請求履歴はありません</p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
});
