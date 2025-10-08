/**
 * ÊÓ²ü·çó¶Kn‹š©
 */
export interface NavigationState {
  /** Sidebarn‹‰¶K */
  isSidebarOpen: boolean
  /** Sidebarn‹‰’ŠÿH‹ */
  toggleSidebar: () => void
  /** Sidebar’‹O */
  openSidebar: () => void
  /** Sidebar’‰X‹ */
  closeSidebar: () => void
}

/**
 * ÊÓ²ü·çóîn‹š©
 */
export interface NavigationItem {
  /** îID */
  id: string
  /** h:éÙë */
  label: string
  /** êó¯HURL */
  href: string
  /** ¢¤³ólucide-react³óİüÍóÈ	 */
  icon?: React.ComponentType<{ className?: string }>
  /** ĞÃ¸h:p$	 */
  badge?: number
  /** ¢¯Æ£Ö¶Kn$š¢p */
  isActive?: (pathname: string) => boolean
}
