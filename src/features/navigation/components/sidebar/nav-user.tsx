'use client';

import {
  Book,
  Building,
  ChevronDown,
  ExternalLink,
  FileText,
  HelpCircle,
  LogOut,
  Mail,
  Megaphone,
  Palette,
  Settings,
  Shield,
  Sparkles,
  UserCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useSettingsModalStore } from '@/features/settings/stores/useSettingsModalStore';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string | null;
  };
}) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const t = useTranslations();
  const locale = useLocale();
  const openSettingsModal = useSettingsModalStore((state) => state.openModal);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success(t('navUser.logoutSuccess'));
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t('navUser.logoutFailed'));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hover:bg-state-hover data-[state=open]:bg-state-selected flex w-fit items-center gap-2 rounded-lg px-2 py-2 text-left text-sm outline-hidden"
        >
          <Avatar className="h-6 w-6 rounded-2xl">
            {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
            <AvatarFallback className="rounded-2xl">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="max-w-20 truncate font-normal">{user.name}</span>
          <ChevronDown className="text-muted-foreground size-4 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="border-input w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-2xl"
        side="right"
        align="start"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
            <Avatar className="h-6 w-6 rounded-2xl">
              {user.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
              <AvatarFallback className="rounded-2xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-normal">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* アカウント関連 */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openSettingsModal('account')}>
            <UserCircle />
            {t('navUser.account')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openSettingsModal('subscription')}>
            <Sparkles />
            {t('navUser.upgradePlan')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openSettingsModal('personalization')}>
            <Palette />
            {t('navUser.personalize')}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* 設定とヘルプ（Sidebarから移動） */}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => openSettingsModal('general')}>
            <Settings />
            {t('navUser.settings')}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <HelpCircle />
              {t('navUser.help')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="border-input">
              <DropdownMenuItem asChild>
                <Link
                  href="https://github.com/t3-nico/boxlog-app/releases"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Megaphone />
                  {t('navUser.helpSubmenu.releaseNotes')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="https://docs.boxlog.app" target="_blank" rel="noopener noreferrer">
                  <Book />
                  <span className="flex-1">{t('navUser.helpSubmenu.documentation')}</span>
                  <ExternalLink className="text-muted-foreground size-3" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/legal/terms`} target="_blank" rel="noopener noreferrer">
                  <FileText />
                  <span className="flex-1">{t('navUser.helpSubmenu.termsOfService')}</span>
                  <ExternalLink className="text-muted-foreground size-3" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/legal/privacy`} target="_blank" rel="noopener noreferrer">
                  <FileText />
                  <span className="flex-1">{t('navUser.helpSubmenu.privacyPolicy')}</span>
                  <ExternalLink className="text-muted-foreground size-3" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/legal/tokushoho`} target="_blank" rel="noopener noreferrer">
                  <Building />
                  <span className="flex-1">{t('navUser.helpSubmenu.tokushoho')}</span>
                  <ExternalLink className="text-muted-foreground size-3" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/legal/security`} target="_blank" rel="noopener noreferrer">
                  <Shield />
                  <span className="flex-1">{t('navUser.helpSubmenu.security')}</span>
                  <ExternalLink className="text-muted-foreground size-3" />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="mailto:support@boxlog.app">
                  <Mail />
                  {t('navUser.helpSubmenu.contact')}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* ログアウト */}
        <DropdownMenuItem variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut />
          {isLoggingOut ? t('navUser.loggingOut') : t('navUser.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
