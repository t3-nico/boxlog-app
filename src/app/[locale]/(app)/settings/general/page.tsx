import dynamic from 'next/dynamic'

import type { Metadata } from 'next'

import { Subheading } from '@/components/app'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { SettingsLayout } from '@/features/settings/components'
import { getDictionary, createTranslation } from '@/features/i18n/lib'
import type { Locale } from '@/types/i18n'

const Address = dynamic(() => import('../address').then((mod) => ({ default: mod.Address })), {
  ssr: false,
  loading: () => <div className="h-20 animate-pulse rounded bg-gray-200" />,
})

export const metadata: Metadata = {
  title: 'Settings',
}

interface PageProps {
  params: { locale?: Locale }
}

const SettingsPage = async ({ params }: PageProps) => {
  const { locale: localeParam } = await params
  const locale = localeParam || 'ja'
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  return (
    <SettingsLayout title={t('settings.general.title')} description={t('settings.general.description')}>
      <form method="post" className="max-w-4xl">
        <Separator className="my-8" />

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Subheading>{t('settings.general.organizationName.label')}</Subheading>
            <p className="text-base text-neutral-800 dark:text-neutral-200">
              {t('settings.general.organizationName.description')}
            </p>
          </div>
          <div>
            <Input aria-label={t('settings.general.organizationName.label')} name="name" defaultValue="Catalyst" />
          </div>
        </section>

        <Separator className="my-8" />

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Subheading>{t('settings.general.organizationBio.label')}</Subheading>
            <p className="text-base text-neutral-800 dark:text-neutral-200">
              {t('settings.general.organizationBio.description')}
            </p>
          </div>
          <div>
            <Textarea aria-label={t('settings.general.organizationBio.label')} name="bio" />
          </div>
        </section>

        <Separator className="my-8" />

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Subheading>{t('settings.general.organizationEmail.label')}</Subheading>
            <p className="text-base text-neutral-800 dark:text-neutral-200">
              {t('settings.general.organizationEmail.description')}
            </p>
          </div>
          <div className="space-y-4">
            <Input
              type="email"
              aria-label={t('settings.general.organizationEmail.label')}
              name="email"
              defaultValue="info@example.com"
            />
            <div className="flex items-center gap-2">
              <Checkbox id="email_is_public" name="email_is_public" defaultChecked />
              <Label htmlFor="email_is_public">{t('settings.general.organizationEmail.showOnProfile')}</Label>
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Subheading>{t('settings.general.address.label')}</Subheading>
            <p className="text-base text-neutral-800 dark:text-neutral-200">
              {t('settings.general.address.description')}
            </p>
          </div>
          <Address />
        </section>

        <Separator className="my-8" />

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Subheading>{t('settings.general.currency.label')}</Subheading>
            <p className="text-base text-neutral-800 dark:text-neutral-200">
              {t('settings.general.currency.description')}
            </p>
          </div>
          <div>
            <Select defaultValue="cad" name="currency">
              <SelectTrigger>
                <SelectValue placeholder={t('settings.general.currency.select')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cad">{t('settings.general.currency.cad')}</SelectItem>
                <SelectItem value="usd">{t('settings.general.currency.usd')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <Separator className="my-8" />

        <div className="flex justify-end gap-4">
          <Button type="reset" variant="ghost">
            {t('settings.general.actions.reset')}
          </Button>
          <Button type="submit">{t('settings.general.actions.save')}</Button>
        </div>
      </form>
    </SettingsLayout>
  )
}

export default SettingsPage
