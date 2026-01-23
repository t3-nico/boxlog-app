import { redirect } from 'next/navigation';

/**
 * タグページ
 *
 * 現在はカレンダーサイドバーでタグ管理を行うため、
 * カレンダーページにリダイレクト
 *
 * 将来的にタグ専用ページが必要になった場合はここに実装
 */
export default function TagsPage() {
  redirect('/calendar');
}
