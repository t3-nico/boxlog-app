'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/trpc'
import { Calendar, ChevronRight, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTicketInspectorStore } from '../stores/useTicketInspectorStore'

/**
 * Ticket Inspector（全ページ共通Sheet）
 *
 * - Kanban、Calendar、Table等、全ビューから呼び出し可能
 * - useTicketInspectorStoreでグローバル状態管理
 * - レイアウトに配置して常にマウント
 *
 * @example
 * ```tsx
 * // レイアウトに配置
 * <TicketInspector />
 *
 * // 各ビューから呼び出し
 * const { openInspector } = useTicketInspectorStore()
 * <div onClick={() => openInspector(ticket.id)}>...</div>
 * ```
 */
export function TicketInspector() {
  const { isOpen, ticketId, closeInspector } = useTicketInspectorStore()
  const [isEditing, setIsEditing] = useState(false)

  // Ticketデータ取得
  const { data: ticket, isLoading } = api.tickets.getById.useQuery({ id: ticketId! }, { enabled: !!ticketId })

  // 更新Mutation
  const utils = api.useUtils()
  const updateMutation = api.tickets.update.useMutation({
    onSuccess: () => {
      setIsEditing(false)
      utils.tickets.getById.invalidate({ id: ticketId! })
      utils.tickets.list.invalidate()
    },
  })

  // フォームの状態（編集用）
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
  })

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description || '',
        status: ticket.status,
        priority: ticket.priority || 'medium',
      })
    }
  }, [ticket])

  const handleSave = () => {
    if (!ticketId) return
    updateMutation.mutate({
      id: ticketId,
      data: {
        title: formData.title,
        description: formData.description,
        status: formData.status as 'open' | 'in_progress' | 'completed' | 'cancelled',
      },
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeInspector()}>
      <SheetContent className="w-[400px] overflow-y-auto sm:w-[540px]">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
          </div>
        ) : ticket ? (
          <>
            <SheetHeader>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <span>#{ticket.ticket_number}</span>
                <ChevronRight className="h-4 w-4" />
                <Badge variant={ticket.status === 'completed' ? 'default' : 'secondary'}>{ticket.status}</Badge>
              </div>
              <SheetTitle className="text-2xl">
                {isEditing ? (
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="text-2xl font-bold"
                  />
                ) : (
                  ticket.title
                )}
              </SheetTitle>
              <SheetDescription className="sr-only">Ticket詳細情報</SheetDescription>
            </SheetHeader>

            {/* タブ構成 */}
            <Tabs defaultValue="details" className="mt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">詳細</TabsTrigger>
                <TabsTrigger value="sessions">セッション</TabsTrigger>
                <TabsTrigger value="activity">アクティビティ</TabsTrigger>
                <TabsTrigger value="comments">コメント</TabsTrigger>
              </TabsList>

              {/* 詳細タブ */}
              <TabsContent value="details" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">説明</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">{ticket.description || '説明なし'}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>優先度</Label>
                    {isEditing ? (
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full rounded border p-2"
                      >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                      </select>
                    ) : (
                      <Badge
                        variant={
                          ticket.priority === 'high'
                            ? 'destructive'
                            : ticket.priority === 'medium'
                              ? 'default'
                              : 'secondary'
                        }
                      >
                        {ticket.priority}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>ステータス</Label>
                    {isEditing ? (
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full rounded border p-2"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <Badge>{ticket.status}</Badge>
                    )}
                  </div>
                </div>

                {/* メタデータ */}
                <div className="text-muted-foreground space-y-2 border-t pt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>作成: {new Date(ticket.created_at || '').toLocaleString('ja-JP')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>更新: {new Date(ticket.updated_at || '').toLocaleString('ja-JP')}</span>
                  </div>
                  {ticket.planned_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>予定時間: {ticket.planned_hours}h</span>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* その他のタブ（将来実装） */}
              <TabsContent value="sessions">
                <div className="text-muted-foreground py-8 text-center">セッション機能は準備中です</div>
              </TabsContent>

              <TabsContent value="activity">
                <div className="text-muted-foreground py-8 text-center">アクティビティログは準備中です</div>
              </TabsContent>

              <TabsContent value="comments">
                <div className="text-muted-foreground py-8 text-center">コメント機能は準備中です</div>
              </TabsContent>
            </Tabs>

            {/* アクションボタン */}
            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    キャンセル
                  </Button>
                  <Button onClick={handleSave} disabled={updateMutation.isPending}>
                    保存
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>編集</Button>
              )}
            </div>
          </>
        ) : (
          <div>Ticket not found</div>
        )}
      </SheetContent>
    </Sheet>
  )
}
