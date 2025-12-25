/**
 * �Ӳ����Kn���
 */
export interface NavigationState {
  /** Sidebarn���K */
  isSidebarOpen: boolean;
  /** Sidebarn�����H� */
  toggleSidebar: () => void;
  /** Sidebar��O */
  openSidebar: () => void;
  /** Sidebar��X� */
  closeSidebar: () => void;
}

/**
 * �Ӳ�����n���
 */
export interface NavigationItem {
  /** �ID */
  id: string;
  /** h:��� */
  label: string;
  /** ��HURL */
  href: string;
  /** ����lucide-react�������	 */
  icon?: React.ComponentType<{ className?: string }>;
  /** �øh:p$	 */
  badge?: number;
  /** ��ƣֶKn$��p */
  isActive?: (pathname: string) => boolean;
}
