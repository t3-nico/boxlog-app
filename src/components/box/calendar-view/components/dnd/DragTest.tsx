'use client'

import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'

const DRAG_TYPE = 'test-item'

interface DragTestItemProps {
  id: string
  text: string
}

function DragTestItem({ id, text }: DragTestItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: { id, text },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  drag(ref)

  return (
    <div
      ref={ref}
      className={`p-4 bg-blue-500 text-white rounded cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {text} (ID: {id})
      {isDragging && ' - ドラッグ中'}
    </div>
  )
}

function DropZone() {
  const ref = useRef<HTMLDivElement>(null)
  
  const [{ isOver }, drop] = useDrop({
    accept: DRAG_TYPE,
    drop: (item: { id: string; text: string }) => {
      console.log('ドロップされました:', item)
      alert(`ドロップされました: ${item.text}`)
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  })

  drop(ref)

  return (
    <div
      ref={ref}
      className={`p-8 border-2 border-dashed border-gray-400 rounded mt-4 ${
        isOver ? 'bg-green-100 border-green-400' : ''
      }`}
    >
      ここにドロップしてください
      {isOver && ' - ドロップできます！'}
    </div>
  )
}

export function DragTest() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">React DnD テスト</h2>
      <DragTestItem id="test1" text="テストアイテム 1" />
      <DragTestItem id="test2" text="テストアイテム 2" />
      <DropZone />
    </div>
  )
}