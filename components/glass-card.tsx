import React from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  animated?: boolean
  hoverlift?: boolean
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

export function GlassCard({ children, className = '', animated = false, hoverlift = false, style, onClick }: GlassCardProps) {
  return (
    <div
      className={`glass rounded-2xl p-6 ${animated ? 'animate-slideUp' : ''} ${hoverlift ? 'hover-lift' : ''} ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(event as any) } } : undefined}
    >
      {children}
    </div>
  )
}
