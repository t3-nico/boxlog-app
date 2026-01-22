'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function UnderMaintenancePage() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="mx-auto flex min-h-dvh flex-col items-center justify-center gap-8 p-8 md:gap-12 md:p-16">
      <Image
        src="https://ui.shadcn.com/placeholder.svg"
        alt="placeholder image"
        width={960}
        height={540}
        priority
        className="aspect-video w-240 rounded-xl object-cover dark:invert"
      />
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">503</h1>
        <h2 className="mb-4 text-2xl font-bold">{t('error.maintenance.heading')}</h2>
        <p className="text-muted-foreground">{t('error.maintenance.description')}</p>
        <div className="mt-6 flex items-center justify-center gap-4 md:mt-8">
          <Button className="cursor-pointer" onClick={() => router.push('/')}>
            {t('error.common.goHome')}
          </Button>
          <Button
            variant="outline"
            className="flex cursor-pointer items-center gap-1"
            onClick={() => (window.location.href = 'mailto:support@boxlog.com')}
          >
            {t('error.common.contactUs')}
          </Button>
        </div>
      </div>
    </div>
  );
}
