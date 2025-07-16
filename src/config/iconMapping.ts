import {
  PlusCircle as PlusCircleIcon,
  Calendar as CalendarIcon,
  TableProperties as TableCellsIcon,
  SquareKanban as ViewColumnsIcon,
  BarChart3 as ChartBarIcon,
  HelpCircle as QuestionMarkCircleIcon,
  Star as StarIcon,
  Folder as FolderIcon,
  Tag as TagIcon,
  Search as MagnifyingGlassIcon,
} from 'lucide-react'

export const iconMapping = {
  PlusCircleIcon,
  CalendarIcon,
  TableCellsIcon,
  ViewColumnsIcon,
  ChartBarIcon,
  QuestionMarkCircleIcon,
  StarIcon,
  FolderIcon,
  TagIcon,
  MagnifyingGlassIcon,
} as const

export type IconName = keyof typeof iconMapping