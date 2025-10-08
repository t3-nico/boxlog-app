import { createTranslation, getDictionary } from '@/features/i18n/lib'
import type { Locale } from '@/types/i18n'

import BoardPageClient from './client'

interface BoardPageProps {
  params: { locale?: Locale }
}

const BoardPage = async ({ params }: BoardPageProps) => {
  const { locale = 'ja' } = await params

  // サーバーサイドで翻訳辞書を取得
  const dictionary = await getDictionary(locale)
  const t = createTranslation(dictionary, locale)

  // 翻訳テキストを抽出してクライアントに渡す
  const translations = {
    title: t('board.title'),
    description: t('board.description'),
    columns: {
      todo: t('board.columns.todo'),
      inProgress: t('board.columns.inProgress'),
      done: t('board.columns.done'),
    },
    sample: {
      task1: {
        title: t('board.sample.task1.title'),
        description: t('board.sample.task1.description'),
      },
      task2: {
        title: t('board.sample.task2.title'),
        description: t('board.sample.task2.description'),
      },
      task3: {
        title: t('board.sample.task3.title'),
        description: t('board.sample.task3.description'),
      },
    },
  }

  return <BoardPageClient translations={translations} />
}

export default BoardPage
