'use client'

import React from 'react'
import {
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/components/layout/navigation/shared'
import {
  BookOpen,
  MessageCircle,
  ExternalLink,
  FileText,
  Video,
  HelpCircle,
  Mail,
  Clock,
  MessageSquare
} from 'lucide-react'

interface HelpSidebarSectionsProps {
  collapsed: boolean
}

export function HelpSidebarSections({ collapsed }: HelpSidebarSectionsProps) {
  if (collapsed) return null

  // Mock data - In actual implementation, fetch from appropriate data source
  const recentChatSessions = [
    {
      id: '1',
      title: 'Calendar sync issues',
      timestamp: '2 hours ago',
      status: 'resolved'
    },
    {
      id: '2', 
      title: 'How to delete tasks',
      timestamp: '1 day ago',
      status: 'active'
    },
    {
      id: '3',
      title: 'Data export procedures',
      timestamp: '3 days ago',
      status: 'resolved'
    },
    {
      id: '4',
      title: 'Keyboard shortcuts',
      timestamp: '1 week ago',
      status: 'resolved'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Quick Help */}
      <SidebarSection>
        <SidebarHeading>Quick Help</SidebarHeading>
        <SidebarItem href="/help#getting-started" indicator={false}>
          <BookOpen data-slot="icon" />
          <SidebarLabel>Getting Started</SidebarLabel>
        </SidebarItem>
        <SidebarItem href="/help#advanced" indicator={false}>
          <Video data-slot="icon" />
          <SidebarLabel>Advanced Features</SidebarLabel>
        </SidebarItem>
        <SidebarItem href="/help#troubleshooting" indicator={false}>
          <HelpCircle data-slot="icon" />
          <SidebarLabel>Troubleshooting</SidebarLabel>
        </SidebarItem>
      </SidebarSection>

      {/* Support Options */}
      <SidebarSection>
        <SidebarHeading>Support</SidebarHeading>
        <SidebarItem href="/help/chat" indicator={false}>
          <MessageCircle data-slot="icon" />
          <SidebarLabel>Chat Support</SidebarLabel>
        </SidebarItem>
        <SidebarItem href="#" indicator={false}>
          <FileText data-slot="icon" />
          <SidebarLabel>Documentation</SidebarLabel>
        </SidebarItem>
        <SidebarItem href="mailto:support@boxlog.app" indicator={false}>
          <Mail data-slot="icon" />
          <SidebarLabel>Contact Us</SidebarLabel>
        </SidebarItem>
      </SidebarSection>

      {/* Recent Chat History */}
      <SidebarSection>
        <div className="flex items-center justify-between">
          <SidebarHeading>Chat History</SidebarHeading>
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View All
          </button>
        </div>
        <div className="space-y-1">
          {recentChatSessions.slice(0, 4).map((session) => (
            <div
              key={session.id}
              className="group flex flex-col gap-1 rounded-lg px-2 py-2 text-left text-sm font-medium transition-colors hover:bg-accent/50 cursor-pointer"
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  {session.status === 'active' ? (
                    <MessageSquare className="w-3 h-3 text-blue-500" />
                  ) : (
                    <MessageCircle className="w-3 h-3 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-foreground line-clamp-2 leading-tight">
                    {session.title}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">
                      {session.timestamp}
                    </span>
                    {session.status === 'active' && (
                      <span className="text-[10px] text-blue-500 font-medium ml-1">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {recentChatSessions.length === 0 && (
          <div className="px-2 py-3 text-xs text-muted-foreground text-center">
            No chat history available
          </div>
        )}
        
        <SidebarItem href="/help/chat-history" indicator={false} className="mt-2">
          <MessageSquare data-slot="icon" />
          <SidebarLabel>View All History</SidebarLabel>
        </SidebarItem>
      </SidebarSection>
    </div>
  )
}