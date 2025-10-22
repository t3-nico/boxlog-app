interface DataTableEmptyProps {
  onCreateTask?: () => void
}

export function DataTableEmpty({ onCreateTask: _onCreateTask }: DataTableEmptyProps) {
  return <div className="text-muted-foreground">データがありません</div>
}
