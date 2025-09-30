const BoardPage = () => {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Board View</h1>
          <p className="mt-2 text-neutral-800 dark:text-neutral-200">Kanban style task management</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Todo Column */}
          <div
            className="bg-neutral-100 dark:bg-neutral-800 rounded-md shadow-sm p-4"
          >
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Todo</h2>
            <div className="flex flex-col gap-2">
              <div
                className="bg-neutral-200 dark:bg-neutral-700 p-2 rounded border-l-4 border-blue-500 dark:border-blue-600"
              >
                <h3 className="font-semibold">Sample Task 1</h3>
                <p className="text-sm text-neutral-800 dark:text-neutral-200">Task description</p>
              </div>
            </div>
          </div>

          {/* In Progress Column */}
          <div
            className="bg-neutral-100 dark:bg-neutral-800 rounded-md shadow-sm p-4"
          >
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">In Progress</h2>
            <div className="flex flex-col gap-2">
              <div
                className="bg-neutral-200 dark:bg-neutral-700 p-2 rounded border-l-4 border-yellow-500 dark:border-yellow-600"
              >
                <h3 className="font-semibold">Sample Task 2</h3>
                <p className="text-sm text-neutral-800 dark:text-neutral-200">Task in progress</p>
              </div>
            </div>
          </div>

          {/* Done Column */}
          <div
            className="bg-neutral-100 dark:bg-neutral-800 rounded-md shadow-sm p-4"
          >
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Done</h2>
            <div className="flex flex-col gap-2">
              <div
                className="bg-neutral-200 dark:bg-neutral-700 p-2 rounded border-l-4 border-green-500 dark:border-green-600"
              >
                <h3 className="font-semibold">Sample Task 3</h3>
                <p className="text-sm text-neutral-800 dark:text-neutral-200">Completed task</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BoardPage
