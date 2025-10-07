'use client'

import { Book, ExternalLink, MessageSquare } from 'lucide-react'

import { useI18n } from '@/features/i18n/lib/hooks'

export const HelpContent = () => {
  const { t } = useI18n()

  const helpSections = [
    {
      title: 'Getting Started',
      items: [
        { title: t('help.content.quickStartGuide'), description: t('help.content.learnBasics') },
        { title: t('help.content.creatingFirstTask'), description: 'Step-by-step tutorial' },
        { title: t('help.content.settingUpWorkspace'), description: t('help.content.customizeEnvironment') },
      ],
    },
    {
      title: 'Features',
      items: [
        { title: 'Calendar View', description: t('help.content.manageTasksCalendar') },
        { title: 'Tags & Smart Folders', description: t('help.content.organizeTags') },
        { title: 'Productivity Analytics', description: t('help.content.understandPatterns') },
      ],
    },
    {
      title: 'Troubleshooting',
      items: [
        { title: 'Common Issues', description: t('help.content.frequentProblems') },
        { title: 'Performance Tips', description: t('help.content.optimizeExperience') },
        { title: 'Data Backup', description: 'Keep your data safe' },
      ],
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-600">
          <Book className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-foreground mb-2 text-lg font-semibold">Help & Support</h3>
        <p className="text-muted-foreground text-sm">Find answers and learn how to make the most of BoxLog</p>
      </div>

      <div className="space-y-6">
        {helpSections.map((section) => (
          <div key={`section-${section.title}`}>
            <h4 className="text-foreground mb-3 font-medium">{section.title}</h4>
            <div className="space-y-2">
              {section.items.map((item) => (
                <button
                  type="button"
                  key={`${section.title}-${item.title}`}
                  className="hover:bg-accent/50 group flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors"
                >
                  <div>
                    <div className="text-foreground mb-1 font-medium">{item.title}</div>
                    <div className="text-muted-foreground text-sm">{item.description}</div>
                  </div>
                  <ExternalLink className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-background border-border mt-8 rounded-lg border p-4">
        <div className="mb-2 flex items-center gap-3">
          <MessageSquare className={`h-6 w-6 text-blue-600 dark:text-blue-400`} />
          <span className="text-foreground font-medium">Need more help?</span>
        </div>
        <p className="text-muted-foreground mb-3 text-sm">
          Can&apos;t find what you&apos;re looking for? Contact our support team.
        </p>
        <button
          type="button"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Contact Support →
        </button>
      </div>
    </div>
  )
}
