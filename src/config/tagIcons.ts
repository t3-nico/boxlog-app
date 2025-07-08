import {
  // Work & Business
  BriefcaseIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  
  // Development & Tech
  CodeBracketIcon,
  CommandLineIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  ServerIcon,
  CircleStackIcon,
  RocketLaunchIcon,
  
  // Design & Creative
  PaintBrushIcon,
  SwatchIcon,
  CubeIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  
  // Personal & Life
  UserIcon,
  HeartIcon,
  HomeIcon,
  ShoppingCartIcon,
  GiftIcon,
  CalendarIcon,
  
  // Learning & Knowledge
  BookOpenIcon,
  AcademicCapIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  LanguageIcon,
  
  // Health & Fitness
  BoltIcon,
  SparklesIcon,
  BeakerIcon,
  FireIcon,
  SunIcon,
  MoonIcon,
  
  // Communication
  ChatBubbleLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MegaphoneIcon,
  
  // Navigation & Movement
  ForwardIcon,
  ArrowRightIcon,
  MapPinIcon,
  GlobeEuropeAfricaIcon,
  
  // General
  TagIcon,
  StarIcon,
  FlagIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

export const tagIconMapping = {
  // Work & Business
  BriefcaseIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
  
  // Development & Tech
  CodeBracketIcon,
  CommandLineIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  ServerIcon,
  CircleStackIcon,
  RocketLaunchIcon,
  
  // Design & Creative
  PaintBrushIcon,
  SwatchIcon,
  CubeIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  
  // Personal & Life
  UserIcon,
  HeartIcon,
  HomeIcon,
  ShoppingCartIcon,
  GiftIcon,
  CalendarIcon,
  
  // Learning & Knowledge
  BookOpenIcon,
  AcademicCapIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  LanguageIcon,
  
  // Health & Fitness
  BoltIcon,
  SparklesIcon,
  BeakerIcon,
  FireIcon,
  SunIcon,
  MoonIcon,
  
  // Communication
  ChatBubbleLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MegaphoneIcon,
  
  // Navigation & Movement
  ForwardIcon,
  ArrowRightIcon,
  MapPinIcon,
  GlobeEuropeAfricaIcon,
  
  // General
  TagIcon,
  StarIcon,
  FlagIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
}

export type TagIconName = keyof typeof tagIconMapping

export const tagIconCategories = {
  'Work & Business': [
    'BriefcaseIcon',
    'BuildingOfficeIcon', 
    'ChartBarIcon',
    'ClipboardDocumentListIcon',
    'DocumentTextIcon',
    'PresentationChartLineIcon',
  ],
  'Development & Tech': [
    'CodeBracketIcon',
    'CommandLineIcon',
    'ComputerDesktopIcon',
    'CpuChipIcon',
    'ServerIcon',
    'CircleStackIcon',
    'RocketLaunchIcon',
  ],
  'Design & Creative': [
    'PaintBrushIcon',
    'SwatchIcon',
    'CubeIcon',
    'PhotoIcon',
    'VideoCameraIcon',
    'MusicalNoteIcon',
  ],
  'Personal & Life': [
    'UserIcon',
    'HeartIcon',
    'HomeIcon',
    'ShoppingCartIcon',
    'GiftIcon',
    'CalendarIcon',
  ],
  'Learning & Knowledge': [
    'BookOpenIcon',
    'AcademicCapIcon',
    'LightBulbIcon',
    'MagnifyingGlassIcon',
    'GlobeAltIcon',
    'LanguageIcon',
  ],
  'Health & Fitness': [
    'BoltIcon',
    'SparklesIcon',
    'BeakerIcon',
    'FireIcon',
    'SunIcon',
    'MoonIcon',
  ],
  'Communication': [
    'ChatBubbleLeftIcon',
    'EnvelopeIcon',
    'PhoneIcon',
    'MegaphoneIcon',
  ],
  'Navigation & Movement': [
    'ForwardIcon',
    'ArrowRightIcon',
    'MapPinIcon',
    'GlobeEuropeAfricaIcon',
  ],
  'General': [
    'TagIcon',
    'StarIcon',
    'FlagIcon',
    'ExclamationTriangleIcon',
    'InformationCircleIcon',
    'CheckCircleIcon',
  ],
} as const