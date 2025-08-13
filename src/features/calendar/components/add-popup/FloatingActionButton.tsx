'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/shadcn-ui/button'
import { motion } from 'framer-motion'

interface FloatingActionButtonProps {
  onClick: () => void
  className?: string
}

export function FloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <motion.div
      className={`fixed bottom-8 right-8 z-50 ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <Button
          onClick={onClick}
          size="lg"
          className="
            h-16 w-16 rounded-full shadow-lg hover:shadow-xl 
            bg-primary hover:bg-primary/90 
            border-2 border-background/20
            transition-all duration-200
          "
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">新しいアイテムを作成</span>
        </Button>
      </motion.div>

      {/* Tooltip */}
      <motion.div
        className="
          absolute right-16 top-1/2 -translate-y-1/2
          bg-background border border-border rounded-md px-4 py-2
          text-sm font-medium whitespace-nowrap
          shadow-md opacity-0 pointer-events-none
          group-hover:opacity-100 group-hover:pointer-events-auto
          transition-opacity duration-200
        "
        initial={{ opacity: 0, x: 10 }}
        whileHover={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        新しいアイテムを作成
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-background border-r border-b border-border rotate-45" />
      </motion.div>

      {/* Keyboard shortcut hint */}
      <motion.div
        className="
          absolute -top-8 left-1/2 -translate-x-1/2
          bg-muted/90 backdrop-blur-sm rounded px-2 py-2
          text-xs text-muted-foreground
          opacity-0 animate-pulse
          group-hover:opacity-100
          transition-opacity duration-200
        "
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ delay: 2, duration: 0.3 }}
      >
        Ctrl+N
      </motion.div>
    </motion.div>
  )
}

// Alternative compact version for smaller screens
export function CompactFloatingActionButton({ onClick, className }: FloatingActionButtonProps) {
  return (
    <motion.div
      className={`fixed bottom-4 right-4 z-50 md:hidden ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <Button
          onClick={onClick}
          size="sm"
          className="
            h-12 w-12 rounded-full shadow-lg
            bg-primary hover:bg-primary/90 
            transition-all duration-200
          "
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">新しいアイテムを作成</span>
        </Button>
      </motion.div>
    </motion.div>
  )
}