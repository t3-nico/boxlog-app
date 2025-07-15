'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, TaskStatus, TaskPriority, Comment, Attachment } from '@/types/box'
import { useBoxStore } from '@/lib/box-store'
import { useToast } from '@/components/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Paperclip,
  MessageCircle,
  Clock as ClockIcon,
  Calendar,
  Tag,
  Pencil,
  Trash2,
} from 'lucide-react'
import { 
  Circle,
  Clock, 
  CheckCircle2, 
  XCircle, 
  Minus,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

interface TaskDetailModalProps {
  task: Task | null
  open: boolean
  onClose: () => void
}

const getStatusIcon = (status: TaskStatus) => {
  const iconProps = "h-4 w-4"
  switch (status) {
    case 'Todo':
      return <Circle className={`${iconProps} text-gray-500`} />
    case 'In Progress':
      return <Clock className={`${iconProps} text-blue-500`} />
    case 'Done':
      return <CheckCircle2 className={`${iconProps} text-green-500`} />
    case 'Backlog':
      return <Minus className={`${iconProps} text-gray-400`} />
    case 'Cancelled':
      return <XCircle className={`${iconProps} text-red-500`} />
    default:
      return <Circle className={`${iconProps} text-gray-500`} />
  }
}

const getPriorityIcon = (priority: TaskPriority) => {
  const iconProps = "h-4 w-4"
  switch (priority) {
    case 'High':
      return <ArrowUp className={`${iconProps} text-red-500`} />
    case 'Medium':
      return <Minus className={`${iconProps} text-yellow-500`} />
    case 'Low':
      return <ArrowDown className={`${iconProps} text-green-500`} />
    default:
      return <Minus className={`${iconProps} text-gray-500`} />
  }
}

const getTaskTypeBadge = (type: string) => {
  switch (type) {
    case 'Bug':
      return <Badge color="red">{type}</Badge>
    case 'Feature':
      return <Badge color="blue">{type}</Badge>
    case 'Documentation':
      return <Badge color="green">{type}</Badge>
    default:
      return <Badge color="zinc">{type}</Badge>
  }
}

export function TaskDetailModal({ task, open, onClose }: TaskDetailModalProps) {
  const { updateTask } = useBoxStore()
  const { success, error } = useToast()
  
  const [isEditing, setIsEditing] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [editedTask, setEditedTask] = useState<Partial<Task>>({})

  if (!task) return null

  const handleSave = async () => {
    try {
      const result = await updateTask(task.id, editedTask)
      if (result) {
        success('Task updated', 'Task details have been saved successfully')
        setIsEditing(false)
        setEditedTask({})
      } else {
        error('Update failed', 'Failed to save task details')
      }
    } catch (err) {
      error('Save failed', 'An error occurred while saving')
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    try {
      const newCommentObj: Comment = {
        id: `c_${Date.now()}`,
        content: newComment,
        createdAt: new Date(),
        author: 'Current User'
      }
      
      const updatedComments = [...(task.comments || []), newCommentObj]
      const result = await updateTask(task.id, { comments: updatedComments })
      
      if (result) {
        success('Comment added', 'Your comment has been added successfully')
        setNewComment('')
      } else {
        error('Failed to add comment', 'Please try again')
      }
    } catch (err) {
      error('Comment failed', 'An error occurred while adding comment')
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DialogTitle className="text-xl">
                {task.task}
              </DialogTitle>
              {getTaskTypeBadge(task.type)}
            </div>
            <Button
              outline
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2"
            >
              <Pencil className="h-4 w-4" />
              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div>
            {isEditing ? (
              <Input
                value={editedTask.title ?? task.title}
                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                className="text-lg font-medium"
                placeholder="Task title"
              />
            ) : (
              <h2 className="text-lg font-medium">{task.title}</h2>
            )}
          </div>

          {/* Status and Priority */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              {getStatusIcon(task.status)}
              <span className="text-sm font-medium">Status:</span>
              <Badge color="blue">{task.status}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              {getPriorityIcon(task.priority)}
              <span className="text-sm font-medium">Priority:</span>
              <Badge color="yellow">{task.priority}</Badge>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Description</Label>
            {isEditing ? (
              <Textarea
                value={editedTask.description ?? task.description ?? ''}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                placeholder="Task description..."
                rows={4}
              />
            ) : (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {task.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Due Date:</span>
                <span className="text-sm text-gray-600">
                  {task.dueDate ? formatDate(task.dueDate) : 'Not set'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Estimated:</span>
                <span className="text-sm text-gray-600">
                  {task.estimatedHours ? `${task.estimatedHours}h` : 'Not set'}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm text-gray-600">{formatDate(task.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Updated:</span>
                <span className="text-sm text-gray-600">{formatDate(task.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <Badge key={index} color="zinc" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tabs for Attachments and Comments */}
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="comments" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Comments ({task.comments?.length || 0})</span>
              </TabsTrigger>
              <TabsTrigger value="attachments" className="flex items-center space-x-2">
                <Paperclip className="h-4 w-4" />
                <span>Attachments ({task.attachments?.length || 0})</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="comments" className="space-y-4">
              {/* Add Comment */}
              <div className="space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={3}
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  Add Comment
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                <AnimatePresence>
                  {task.comments?.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-gray-50 p-3 rounded-md border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{comment.author}</span>
                        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {(!task.comments || task.comments.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">No comments yet.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4">
              {/* Attachments List */}
              <div className="space-y-3">
                {task.attachments?.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                    <div className="flex items-center space-x-3">
                      <Paperclip className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(attachment.size)} • {formatDate(attachment.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <Button outline className="text-xs">
                      Download
                    </Button>
                  </div>
                ))}
                {(!task.attachments || task.attachments.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">No attachments.</p>
                )}
              </div>

              {/* Add Attachment */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Paperclip className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Drop files here or click to upload
                </p>
                <Button outline className="mt-2" disabled>
                  Choose Files
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button outline onClick={() => {
                setIsEditing(false)
                setEditedTask({})
              }}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}