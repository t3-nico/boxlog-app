import {
  GraduationCap as AcademicCapIcon,
  ArrowRight as ArrowRightIcon,
  Beaker as BeakerIcon,
  // Health & Fitness
  Zap as BoltIcon,
  // Learning & Knowledge
  BookOpen as BookOpenIcon,
  // Work & Business
  Briefcase as BriefcaseIcon,
  Building2 as BuildingOfficeIcon,
  Calendar as CalendarIcon,
  BarChart3 as ChartBarIcon,
  // Communication
  MessageCircle as ChatBubbleLeftIcon,
  CheckCircle as CheckCircleIcon,
  Database as CircleStackIcon,
  ClipboardList as ClipboardDocumentListIcon,
  // Development & Tech
  Code as CodeBracketIcon,
  Terminal as CommandLineIcon,
  Monitor as ComputerDesktopIcon,
  Cpu as CpuChipIcon,
  Box as CubeIcon,
  FileText as DocumentTextIcon,
  Mail as EnvelopeIcon,
  AlertTriangle as ExclamationTriangleIcon,
  Flame as FireIcon,
  Flag as FlagIcon,
  // Navigation & Movement
  FastForward as ForwardIcon,
  Gift as GiftIcon,
  Globe as GlobeAltIcon,
  Globe2 as GlobeEuropeAfricaIcon,
  Heart as HeartIcon,
  Home as HomeIcon,
  Info as InformationCircleIcon,
  Languages as LanguageIcon,
  Lightbulb as LightBulbIcon,
  Search as MagnifyingGlassIcon,
  MapPin as MapPinIcon,
  Megaphone as MegaphoneIcon,
  Moon as MoonIcon,
  Music as MusicalNoteIcon,
  // Design & Creative
  Paintbrush as PaintBrushIcon,
  Phone as PhoneIcon,
  Image as PhotoIcon,
  TrendingUp as PresentationChartLineIcon,
  Rocket as RocketLaunchIcon,
  Server as ServerIcon,
  ShoppingCart as ShoppingCartIcon,
  Sparkles as SparklesIcon,
  Star as StarIcon,
  Sun as SunIcon,
  Palette as SwatchIcon,
  // General
  Tag as TagIcon,
  // Personal & Life
  User as UserIcon,
  Video as VideoCameraIcon,
} from 'lucide-react';

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
};

export type TagIconName = keyof typeof tagIconMapping;

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
  'Health & Fitness': ['BoltIcon', 'SparklesIcon', 'BeakerIcon', 'FireIcon', 'SunIcon', 'MoonIcon'],
  Communication: ['ChatBubbleLeftIcon', 'EnvelopeIcon', 'PhoneIcon', 'MegaphoneIcon'],
  'Navigation & Movement': ['ForwardIcon', 'ArrowRightIcon', 'MapPinIcon', 'GlobeEuropeAfricaIcon'],
  General: [
    'TagIcon',
    'StarIcon',
    'FlagIcon',
    'ExclamationTriangleIcon',
    'InformationCircleIcon',
    'CheckCircleIcon',
  ],
} as const;
