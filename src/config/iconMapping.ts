import {
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
} from '@heroicons/react/20/solid'

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