'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface GalleryCardProps {
  id: number
  imageUrl?: string
  videoUrl?: string
  quote: string
  delay?: number
}

export function InteractiveGalleryCard({ 
  id, 
  imageUrl = '/image.png', 
  videoUrl = '/miss.mp4',
  quote = 'Every moment of happiness is a celebration of life itself.',
  delay = 0 
}: GalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [videoKey, setVideoKey] = useState(0)

  // Typewriter effect
  useEffect(() => {
    if (!isExpanded) {
      setDisplayedText('')
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    let currentIndex = 0
    const fullText = quote

    const typeTimer = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          setIsTyping(false)
          clearInterval(interval)
        }
      }, 35) // Speed of typewriter effect

      return () => clearInterval(interval)
    }, 150) // Delay before typing starts

    return () => clearTimeout(typeTimer)
  }, [isExpanded, quote])

  const handleExpand = () => {
    setIsExpanded(true)
    setVideoKey(prev => prev + 1)
  }

  const handleClose = () => {
    setIsExpanded(false)
    setIsHovered(false)
  }

  return (
    <>
      {/* Regular Card */}
      <div 
        className="group relative h-72 rounded-2xl cursor-pointer z-10"
        onMouseEnter={() => {
          setIsHovered(true)
          setVideoKey(prev => prev + 1)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          if (!isExpanded) setDisplayedText('')
        }}
        onClick={handleExpand}
      >
        {/* Glow effect on hover */}
        <div className="absolute -inset-2 bg-gradient-to-br from-primary/50 to-secondary/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Main card container */}
        <div 
          className="relative w-full h-full rounded-2xl overflow-hidden transition-all duration-500 ease-out"
        >
          {/* Background Image */}
          <img
            src={imageUrl}
            alt={`Story ${id}`}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 group-hover:blur-sm"
          />

          {/* Video Background - Subtle in card */}
          <video
            key={videoKey}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-70 transition-opacity duration-700 ease-out"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Hover hint text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <p className="text-sm text-primary/80 font-semibold tracking-wider uppercase">Click to expand</p>
          </div>
        </div>
      </div>

      {/* Expanded Full-Screen Overlay */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Expanded Video Container - Covers Full Gallery Section */}
          <div 
            className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-2xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Expanded Video */}
            <video
              key={`${videoKey}-expanded`}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>

            {/* Dark gradient overlay for text */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-transparent" />

            {/* Typewriter Quote - Full Screen */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
              <div className="text-center space-y-6 max-w-3xl">
                {/* Opening quote mark */}
                <div className="text-7xl text-primary/70 leading-none">"</div>
                
                {/* Typewriter animated quote */}
                <p className="text-2xl md:text-3xl font-light text-white/95 leading-relaxed min-h-32 flex items-center justify-center">
                  {displayedText}
                  {isTyping && <span className="ml-2 w-1 h-10 bg-primary/80 inline-block animate-pulse" />}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors duration-300 z-10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
