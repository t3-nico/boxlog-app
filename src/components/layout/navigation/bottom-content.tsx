'use client'

import React from 'react'

import { CommonBottomSections } from './shared'

export const BottomContent = () => {
  return (
    <div className="flex-shrink-0 mt-6">
      <CommonBottomSections collapsed={false} />
    </div>
  )
}