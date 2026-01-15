'use client';

import { useState } from 'react';

import NextImage from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSupportText,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useAuthStore } from '@/features/auth/stores/useAuthStore';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export function PasswordResetForm({ className, ...props }: React.ComponentProps<'div'>) {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const resetPassword = useAuthStore((state) => state.resetPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An error occurred while resetting the password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={cn('flex flex-col gap-6', className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">{t('auth.passwordResetForm.checkEmail')}</h1>
                  <p className="text-muted-foreground text-balance">
                    {t('auth.passwordResetForm.sentResetLink')}{' '}
                    <span className="font-medium">{email}</span>
                  </p>
                </div>
                <Field>
                  <Button asChild>
                    <Link href="/auth/login">{t('auth.passwordResetForm.backToLogin')}</Link>
                  </Button>
                </Field>
              </FieldGroup>
            </div>
            <div className="bg-container relative hidden md:block">
              <NextImage
                src="/placeholder.svg"
                alt="Decorative background"
                fill
                priority
                sizes="(min-width: 768px) 50vw, 0vw"
                className="object-cover dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{t('auth.passwordResetForm.resetPassword')}</h1>
                <p className="text-muted-foreground text-balance">
                  {t('auth.passwordResetForm.enterEmail')}
                </p>
              </div>
              {error && (
                <FieldError announceImmediately className="text-center">
                  {error}
                </FieldError>
              )}

              <Field>
                <FieldLabel htmlFor="email" required requiredLabel={t('common.form.required')}>
                  {t('auth.passwordResetForm.email')}
                </FieldLabel>
                <FieldSupportText id="email-support">
                  {t('auth.passwordResetForm.emailSupportText')}
                </FieldSupportText>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  enterKeyHint="send"
                  aria-disabled={loading || undefined}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  aria-describedby="email-support"
                />
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>
                  {loading && <Spinner className="mr-2" />}
                  {loading
                    ? t('auth.passwordResetForm.sending')
                    : t('auth.passwordResetForm.sendResetLink')}
                </Button>
              </Field>
              <FieldDescription className="text-center">
                {t('auth.passwordResetForm.rememberPassword')}{' '}
                <Link href="/auth/login">{t('auth.passwordResetForm.login')}</Link>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-container relative hidden md:block">
            <NextImage
              src="/placeholder.svg"
              alt="Decorative background"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 0vw"
              className="object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
