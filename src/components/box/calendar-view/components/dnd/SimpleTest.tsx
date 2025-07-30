'use client'

import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'

const ItemType = 'simple-test'

function SimpleDragItem() {
  const ref = useRef<HTMLDivElement>(null)
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType,
    item: { id: 'test' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  drag(ref)

  return (
    <div
      ref={ref}
      className={`p-2 bg-blue-500 text-white rounded cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      ドラッグできるアイテム
    </div>
  )
}

function SimpleDropZone() {
  const ref = useRef<HTMLDivElement>(null)
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType,
    drop: () => {
      console.log('ドロップされました！')
      alert('ドロップ成功！')
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }))

  drop(ref)

  return (
    <div
      ref={ref}
      className={`p-4 border-2 border-dashed rounded mt-2 min-h-20 ${
        isOver ? 'bg-green-100 border-green-400' : 'border-gray-400'
      }`}
    >
      ドロップゾーン
    </div>
  )
}

export function SimpleTest() {
  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="font-bold mb-2">React DnD シンプルテスト</h3>
      <SimpleDragItem />
      <SimpleDropZone />
    </div>
  )
}