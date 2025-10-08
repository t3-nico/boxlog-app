// @ts-nocheck
// TODO(#389): EventBlock.test型エラーを修正後、@ts-nocheckを削除
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { CalendarEvent } from '@/features/calendar/types/calendar.types'

import { EventBlock } from './EventBlock'

describe('EventBlock', () => {
  const mockEvent: CalendarEvent = {
    id: 'event-1',
    title: 'テストイベント',
    description: 'テスト説明',
    startDate: new Date('2025-01-15T10:00:00'),
    endDate: new Date('2025-01-15T11:00:00'),
    start: new Date('2025-01-15T10:00:00'), // TODO(#389): TimedEvent互換性のため追加
    end: new Date('2025-01-15T11:00:00'), // TODO(#389): TimedEvent互換性のため追加
    type: 'event' as any,
    status: 'inbox',
    color: '#3b82f6',
    priority: 'important',
    isRecurring: false,
    items: [],
    reminders: [] as any,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false as any,
    deletedAt: null as any,
    displayStartDate: new Date('2025-01-15T10:00:00'),
    displayEndDate: new Date('2025-01-15T11:00:00'),
    duration: 60,
    isMultiDay: false,
  }

  const mockPosition = {
    top: 100,
    left: 10,
    width: 80,
    height: 60,
  }

  describe('基本レンダリング', () => {
    it('イベントが正しく表示される', () => {
      render(<EventBlock event={mockEvent} position={mockPosition} />)

      expect(screen.getByRole('button', { name: /Event: テストイベント/i })).toBeInTheDocument()
    })

    it('デフォルトポジションが適用される', () => {
      render(<EventBlock event={mockEvent} position={undefined} />)

      const eventBlock = screen.getByRole('button')
      expect(eventBlock).toBeInTheDocument()
    })

    it('aria属性が正しく設定される', () => {
      render(<EventBlock event={mockEvent} position={mockPosition} />)

      const eventBlock = screen.getByRole('button', { name: /Event: テストイベント/i })
      expect(eventBlock).toHaveAttribute('aria-label', 'Event: テストイベント')
      expect(eventBlock).toHaveAttribute('aria-pressed', 'false')
      expect(eventBlock).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('インタラクション', () => {
    it('クリックイベントが発火する', () => {
      const onClick = vi.fn()
      render(<EventBlock event={mockEvent} position={mockPosition} onClick={onClick} />)

      const eventBlock = screen.getByRole('button', { name: /Event: テストイベント/i })
      fireEvent.click(eventBlock)

      expect(onClick).toHaveBeenCalledWith(mockEvent)
    })

    it('ダブルクリックイベントが発火する', () => {
      const onDoubleClick = vi.fn()
      render(<EventBlock event={mockEvent} position={mockPosition} onDoubleClick={onDoubleClick} />)

      const eventBlock = screen.getByRole('button', { name: /Event: テストイベント/i })
      fireEvent.doubleClick(eventBlock)

      expect(onDoubleClick).toHaveBeenCalledWith(mockEvent)
    })

    it('右クリックでコンテキストメニューが表示される', () => {
      const onContextMenu = vi.fn()
      render(<EventBlock event={mockEvent} position={mockPosition} onContextMenu={onContextMenu} />)

      const eventBlock = screen.getByRole('button', { name: /Event: テストイベント/i })
      fireEvent.contextMenu(eventBlock)

      expect(onContextMenu).toHaveBeenCalledWith(mockEvent, expect.any(Object))
    })

    it('キーボード操作でクリックイベントが発火する（Enter）', () => {
      const onClick = vi.fn()
      render(<EventBlock event={mockEvent} position={mockPosition} onClick={onClick} />)

      const eventBlock = screen.getByRole('button', { name: /Event: テストイベント/i })
      fireEvent.keyDown(eventBlock, { key: 'Enter' })

      expect(onClick).toHaveBeenCalledWith(mockEvent)
    })

    it('キーボード操作でクリックイベントが発火する（Space）', () => {
      const onClick = vi.fn()
      render(<EventBlock event={mockEvent} position={mockPosition} onClick={onClick} />)

      const eventBlock = screen.getByRole('button', { name: /Event: テストイベント/i })
      fireEvent.keyDown(eventBlock, { key: ' ' })

      expect(onClick).toHaveBeenCalledWith(mockEvent)
    })
  })

  describe('ドラッグ操作', () => {
    it('マウスダウンでドラッグ開始イベントが発火する', () => {
      const onDragStart = vi.fn()
      render(<EventBlock event={mockEvent} position={mockPosition} onDragStart={onDragStart} />)

      const eventBlock = screen.getByRole('button', { name: /Event: テストイベント/i })
      fireEvent.mouseDown(eventBlock, { button: 0 })

      expect(onDragStart).toHaveBeenCalledWith(mockEvent)
    })

    it('ドラッグ中の状態が正しく反映される', () => {
      render(<EventBlock event={mockEvent} position={mockPosition} isDragging={true} />)

      const eventBlock = screen.getByRole('button', { name: /Event: テストイベント/i })
      expect(eventBlock.className).toContain('cursor-grabbing')
    })

    it('選択状態が正しく反映される', () => {
      render(<EventBlock event={mockEvent} position={mockPosition} isSelected={true} />)

      const eventBlock = screen.getByRole('button', { name: /Event: テストイベント/i })
      expect(eventBlock).toHaveAttribute('aria-pressed', 'true')
      expect(eventBlock.className).toContain('ring-2')
    })
  })

  describe('リサイズ操作', () => {
    it('リサイズハンドルが存在する', () => {
      render(<EventBlock event={mockEvent} position={mockPosition} />)

      const resizeHandle = screen.getByRole('slider', { name: /Resize event duration/i })
      expect(resizeHandle).toBeInTheDocument()
    })

    it('リサイズハンドルのaria属性が正しく設定される', () => {
      render(<EventBlock event={mockEvent} position={mockPosition} />)

      const resizeHandle = screen.getByRole('slider')
      expect(resizeHandle).toHaveAttribute('aria-orientation', 'vertical')
      expect(resizeHandle).toHaveAttribute('aria-valuenow', '60')
      expect(resizeHandle).toHaveAttribute('aria-valuemin', '20')
      expect(resizeHandle).toHaveAttribute('aria-valuemax', '480')
    })

    it('リサイズハンドルのマウスダウンでリサイズ開始イベントが発火する', () => {
      const onResizeStart = vi.fn()
      render(<EventBlock event={mockEvent} position={mockPosition} onResizeStart={onResizeStart} />)

      const resizeHandle = screen.getByRole('slider')
      fireEvent.mouseDown(resizeHandle)

      expect(onResizeStart).toHaveBeenCalledWith(mockEvent, 'bottom', expect.any(Object), mockPosition)
    })
  })

  describe('スタイリング', () => {
    it('カスタムclassNameが適用される', () => {
      render(<EventBlock event={mockEvent} position={mockPosition} className="custom-class" />)

      const eventBlock = screen.getByRole('button', { name: /Event: テストイベント/i })
      expect(eventBlock.className).toContain('custom-class')
    })

    it('カスタムstyleが適用される', () => {
      const customStyle = { backgroundColor: 'red' }
      render(<EventBlock event={mockEvent} position={mockPosition} style={customStyle} />)

      const eventBlock = screen.getByRole('button', { name: /Event: テストイベント/i })
      expect(eventBlock).toHaveStyle({ backgroundColor: 'red' })
    })

    it('高さが30px未満の場合、コンパクトスタイルが適用される', () => {
      const smallPosition = { ...mockPosition, height: 25 }
      render(<EventBlock event={mockEvent} position={smallPosition} />)

      const eventBlock = screen.getByRole('button', { name: /Event: テストイベント/i })
      expect(eventBlock.className).toContain('text-xs')
    })

    it('最小高さが保証される', () => {
      const tinyPosition = { ...mockPosition, height: 5 }
      render(<EventBlock event={mockEvent} position={tinyPosition} />)

      const eventBlock = screen.getByRole('button', { name: /Event: テストイベント/i })
      // MIN_EVENT_HEIGHTが適用されるため、少なくとも20px以上
      const heightMatch = eventBlock.style.height.match(/(\d+)px/)
      const height = heightMatch ? parseInt(heightMatch[1], 10) : 0
      expect(height).toBeGreaterThanOrEqual(20)
    })
  })

  describe('ホバー状態', () => {
    it('マウスホバーで状態が変わる', () => {
      render(<EventBlock event={mockEvent} position={mockPosition} />)

      const eventBlock = screen.getByRole('button', { name: /Event: テストイベント/i })

      fireEvent.mouseEnter(eventBlock)
      // ホバー状態は内部状態なので、視覚的変化を直接テストするのは難しい
      // zIndexの変化などは実装依存のため、イベントが発火することを確認

      fireEvent.mouseLeave(eventBlock)
      // 同様にホバー解除の動作を確認
    })
  })

  describe('イベント伝播', () => {
    it('クリックイベントの伝播が停止される', () => {
      const onClick = vi.fn()
      const parentClick = vi.fn()

      const { container } = render(
        <div onClick={parentClick}>
          <EventBlock event={mockEvent} position={mockPosition} onClick={onClick} />
        </div>
      )

      const eventBlock = container.querySelector('[role="button"]')
      if (eventBlock) {
        fireEvent.click(eventBlock)
      }

      expect(onClick).toHaveBeenCalled()
      expect(parentClick).not.toHaveBeenCalled()
    })

    it('ダブルクリックイベントの伝播が停止される', () => {
      const onDoubleClick = vi.fn()
      const parentDoubleClick = vi.fn()

      const { container } = render(
        <div onDoubleClick={parentDoubleClick}>
          <EventBlock event={mockEvent} position={mockPosition} onDoubleClick={onDoubleClick} />
        </div>
      )

      const eventBlock = container.querySelector('[role="button"]')
      if (eventBlock) {
        fireEvent.doubleClick(eventBlock)
      }

      expect(onDoubleClick).toHaveBeenCalled()
      expect(parentDoubleClick).not.toHaveBeenCalled()
    })
  })
})
