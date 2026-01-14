/**
 * ユーザー公開プロフィールページ
 *
 * @description
 * dayopt.app/{username} でアクセスされる公開ページ。
 * ユーザーが存在しない場合は404を返す。
 *
 * @example
 * dayopt.app/tomoya → tomoyaさんの公開プロフィール
 */
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { isReservedPath } from '@/config/reserved-paths';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  params: Promise<{
    locale: string;
    username: string;
  }>;
}

/**
 * ユーザー名からプロフィールを取得
 */
async function getProfileByUsername(username: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, bio, created_at')
    .eq('username', username)
    .single();

  if (error) {
    // ユーザーが見つからない場合
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Profile fetch error:', error);
    return null;
  }

  return data;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { locale, username } = await params;
  const t = await getTranslations({ locale });

  // 予約パスの場合は404（LP側で処理されるべき）
  if (isReservedPath(username)) {
    notFound();
  }

  // ユーザー存在チェック
  const profile = await getProfileByUsername(username);
  if (!profile) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center">
        {profile.avatar_url && (
          <Image
            src={profile.avatar_url}
            alt={profile.username || ''}
            width={96}
            height={96}
            className="mx-auto mb-4 rounded-full"
          />
        )}
        <h1 className="text-2xl font-bold text-foreground">
          @{profile.username}
        </h1>
        {profile.full_name && (
          <p className="mt-1 text-lg text-foreground">{profile.full_name}</p>
        )}
        {profile.bio && (
          <p className="mt-2 max-w-md text-muted-foreground">{profile.bio}</p>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          {t('userProfile.comingSoon')}
        </p>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;

  return {
    title: `@${username} | Dayopt`,
    description: `${username}'s profile on Dayopt`,
  };
}
