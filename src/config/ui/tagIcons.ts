import {
  // Work & Business
  Briefcase as BriefcaseIcon,
  Building2 as BuildingOfficeIcon,
  BarChart3 as ChartBarIcon,
  ClipboardList as ClipboardDocumentListIcon,
  FileText as DocumentTextIcon,
  TrendingUp as PresentationChartLineIcon,
  
  // Development & Tech
  Code as CodeBracketIcon,
  Terminal as CommandLineIcon,
  Monitor as ComputerDesktopIcon,
  Cpu as CpuChipIcon,
  Server as ServerIcon,
  Database as CircleStackIcon,
  Rocket as RocketLaunchIcon,
  
  // Design & Creative
  Paintbrush as PaintBrushIcon,
  Palette as SwatchIcon,
  Box as CubeIcon,
  Image as PhotoIcon,
  Video as VideoCameraIcon,
  Music as MusicalNoteIcon,
  
  // Personal & Life
  User as UserIcon,
  Heart as HeartIcon,
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  Gift as GiftIcon,
  Calendar as CalendarIcon,
  
  // Learning & Knowledge
  BookOpen as BookOpenIcon,
  GraduationCap as AcademicCapIcon,
  Lightbulb as LightBulbIcon,
  Search as MagnifyingGlassIcon,
  Globe as GlobeAltIcon,
  Languages as LanguageIcon,
  
  // Health & Fitness
  Zap as BoltIcon,
  Sparkles as SparklesIcon,
  Beaker as BeakerIcon,
  Flame as FireIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  
  // Communication
  MessageCircle as ChatBubbleLeftIcon,
  Mail as EnvelopeIcon,
  Phone as PhoneIcon,
  Megaphone as MegaphoneIcon,
  
  // Navigation & Movement
  FastForward as ForwardIcon,
  ArrowRight as ArrowRightIcon,
  MapPin as MapPinIcon,
  Globe2 as GlobeEuropeAfricaIcon,
  
  // General
  Tag as TagIcon,
  Star as StarIcon,
  Flag as FlagIcon,
  AlertTriangle as ExclamationTriangleIcon,
  Info as InformationCircleIcon,
  CheckCircle as CheckCircleIcon,
} from 'lucide-react'

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