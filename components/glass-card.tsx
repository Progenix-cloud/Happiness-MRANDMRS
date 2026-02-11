import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  animated?: boolean
  hoverlift?: boolean
  style?: React.CSSProperties
}

export function GlassCard({ children, className = '', animated = false, hoverlift = false, style }: GlassCardProps) {
  return (
    <div
      className={`glass rounded-2xl p-6 ${animated ? 'animate-slideUp' : ''} ${hoverlift ? 'hover-lift' : ''} ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
