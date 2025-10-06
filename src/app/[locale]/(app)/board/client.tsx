'use client'

interface BoardTranslations {
  title: string
  description: string
  columns: {
    todo: string
    inProgress: string
    done: string
  }
  sample: {
    task1: {
      title: string
      description: string
    }
    task2: {
      title: string
      description: string
    }
    task3: {
      title: string
      description: string
    }
  }
}

interface BoardPageClientProps {
  translations: BoardTranslations
}

const BoardPageClient = ({ translations }: BoardPageClientProps) => {
  const { title, description, columns, sample } = translations

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-neutral-800 dark:text-neutral-200">{description}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Todo Column */}
          <div
            className="bg-neutral-100 dark:bg-neutral-800 rounded-md shadow-sm p-4"
          >
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {columns.todo}
            </h2>
            <div className="flex flex-col gap-2">
              <div
                className="bg-neutral-200 dark:bg-neutral-700 p-2 rounded border-l-4 border-blue-500 dark:border-blue-600"
              >
                <h3 className="font-semibold">{sample.task1.title}</h3>
                <p className="text-sm text-neutral-800 dark:text-neutral-200">
                  {sample.task1.description}
                </p>
              </div>
            </div>
          </div>

          {/* In Progress Column */}
          <div
            className="bg-neutral-100 dark:bg-neutral-800 rounded-md shadow-sm p-4"
          >
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {columns.inProgress}
            </h2>
            <div className="flex flex-col gap-2">
              <div
                className="bg-neutral-200 dark:bg-neutral-700 p-2 rounded border-l-4 border-yellow-500 dark:border-yellow-600"
              >
                <h3 className="font-semibold">{sample.task2.title}</h3>
                <p className="text-sm text-neutral-800 dark:text-neutral-200">
                  {sample.task2.description}
                </p>
              </div>
            </div>
          </div>

          {/* Done Column */}
          <div
            className="bg-neutral-100 dark:bg-neutral-800 rounded-md shadow-sm p-4"
          >
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {columns.done}
            </h2>
            <div className="flex flex-col gap-2">
              <div
                className="bg-neutral-200 dark:bg-neutral-700 p-2 rounded border-l-4 border-green-500 dark:border-green-600"
              >
                <h3 className="font-semibold">{sample.task3.title}</h3>
                <p className="text-sm text-neutral-800 dark:text-neutral-200">
                  {sample.task3.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BoardPageClient
