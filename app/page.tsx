'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Heart, Users, Trophy, Sparkles, Award, Zap, Target, Share2, Star, Crown, Flame } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { GlassCard } from '@/components/glass-card'
import { InteractiveGalleryCard } from '@/components/gallery-card'

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Apply reveal class to elements
      const revealElements = document.querySelectorAll('[data-scroll-reveal]')
      revealElements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const elementTop = rect.top
        const windowHeight = window.innerHeight
        
        // Trigger reveal when element is 30% into viewport
        if (elementTop < windowHeight * 0.7) {
          element.classList.add('revealed')
        }
      })

      setScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Call once on mount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <main className="w-full min-h-screen bg-background overflow-hidden">
      {/* Premium Animated Dark Background with Scroll Interaction */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950">
        {/* Animated background grid with scroll effect */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(245,158,11,.1) 25%, rgba(245,158,11,.1) 26%, transparent 27%, transparent 74%, rgba(245,158,11,.1) 75%, rgba(245,158,11,.1) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(245,158,11,.1) 25%, rgba(245,158,11,.1) 26%, transparent 27%, transparent 74%, rgba(245,158,11,.1) 75%, rgba(245,158,11,.1) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '80px 80px',
            transform: `translateY(${scrollY * 0.1}px) scale(${1 + scrollY * 0.0002})`
          }}
        />
        
        {/* Large morphing orbs with scroll parallax */}
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent rounded-full mix-blend-screen filter blur-3xl animate-float" 
          style={{ transform: `translate(${scrollY * 0.15}px, ${scrollY * 0.3}px) scale(${1 + Math.sin(scrollY * 0.002) * 0.1})` }}
        />
        <div 
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-yellow-500/15 via-amber-500/10 to-transparent rounded-full mix-blend-screen filter blur-3xl animate-float" 
          style={{ animationDelay: '2s', transform: `translate(${scrollY * -0.1}px, ${scrollY * -0.2}px) scale(${1 + Math.cos(scrollY * 0.002) * 0.1})` }}
        />
        
        {/* Mid-screen floating elements */}
        <div 
          className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-r from-yellow-500/15 to-amber-500/10 rounded-full mix-blend-screen filter blur-3xl" 
          style={{ transform: `translate(${scrollY * 0.2}px, ${scrollY * 0.15}px) scale(${1 + Math.sin(scrollY * 0.003) * 0.15})`, animationDuration: '6s' }}
        />
        <div 
          className="absolute top-2/3 right-1/4 w-64 h-64 bg-gradient-to-b from-orange-500/10 via-yellow-500/10 to-transparent rounded-full mix-blend-screen filter blur-3xl animate-pulse" 
          style={{ animationDuration: '5s', transform: `translateY(${scrollY * -0.15}px) scale(${1 + Math.cos(scrollY * 0.0025) * 0.12})` }}
        />
        
        {/* Scroll-responsive accent elements */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at ${50 + (scrollY % 1000) / 20}% ${50 + (scrollY % 1000) / 25}%, rgba(245,158,11,0.1) 0%, transparent 50%)`,
            transition: 'background 0.1s ease-out'
          }}
        />
      </div>

      {/* Premium Hero Section - Video Starting from Left */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
        {/* Full Width Video Background - Starting from Left */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-100 z-0"
          style={{
            filter: 'brightness(1.05) saturate(1.15) contrast(1.1)',
          }}
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        {/* Gradient overlay - Increasing visibility from left to right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-[1]" />

        {/* Content - Left Side */}
        <div className="w-full max-w-xl ml-4 md:ml-12 lg:ml-20 mr-auto px-4 md:px-0 relative z-10">
            {/* Premium Badge */}
            <div className="inline-block mb-6">
              <div className="relative group w-fit">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-full blur opacity-20 group-hover:opacity-60 transition duration-1000 animate-spin" style={{ animationDuration: '3s' }} />
                <div className="px-5 py-2 relative backdrop-blur-xl bg-black/40 border border-white/20 rounded-full">
                  <div className="flex items-center gap-2">
                    <Star className="w-3 h-3 text-primary fill-primary" />
                    <span className="text-primary font-bold text-xs tracking-widest uppercase">✨ Welcome to Celebration</span>
                    <Star className="w-3 h-3 text-primary fill-primary" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <p className="text-white/60 font-light text-xs md:text-sm tracking-[2px] uppercase">Discover The Power Of</p>
              
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight text-white">
                Where
                <span 
                  className="block mt-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)', backgroundSize: '200% 100%', animation: 'gradient-shift 3s ease infinite' }}
                >
                  Happiness
                </span>
                <span className="block mt-3">Takes The</span>
                <span 
                  className="block bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24)', backgroundSize: '200% 100%', animation: 'gradient-shift 3s ease infinite 0.5s' }}
                >
                  Center Stage
                </span>
              </h2>
            </div>

            {/* Subheadline */}
            <div className="space-y-3 mt-6 max-w-lg">
              <p className="text-sm md:text-base text-white/70 leading-relaxed font-light tracking-wide">
                A non-competitive celebration platform where <span className="font-semibold text-primary">everyone is a happiness ambassador</span>.
              </p>
              <p className="text-xs md:text-sm text-white/50 leading-relaxed font-light tracking-wider uppercase">
                Join 5,000+ participants • 6+ age groups • 80 days of transformation
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:shadow-2xl hover:scale-105 h-12 px-8 text-sm hover-lift text-white border-0 relative overflow-hidden group font-semibold rounded-lg">
                      <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/gallery">
                    <Button size="lg" className="h-12 px-8 text-sm glass hover:backdrop-blur-xl hover-lift bg-white/10 border border-white/30 font-semibold rounded-lg text-white hover:text-primary transition-colors">
                      View Gallery
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:shadow-2xl hover:scale-105 h-12 px-8 text-sm hover-lift text-white border-0 relative overflow-hidden group font-semibold rounded-lg">
                      <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      Register Now <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="#about">
                    <Button size="lg" className="h-12 px-8 text-sm glass hover:backdrop-blur-xl hover-lift bg-white/10 border border-white/30 font-semibold rounded-lg text-white hover:text-primary transition-colors">
                      Learn More
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/10">
              {[
                { label: 'Participants', value: '5K+' },
                { label: 'Happy Stories', value: '1K+' },
                { label: 'Age Groups', value: '6+' },
              ].map((stat, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-2xl md:text-3xl font-black text-primary">{stat.value}</p>
                  <p className="text-xs text-white/50 font-semibold tracking-wide uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
        </div>
      </section>

      {/* About Section - Seamless Design */}
      <section id="about" className="py-32 relative overflow-hidden" data-scroll-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-slideInLeft" data-scroll-reveal>
              <div>
                <p className="text-sm font-semibold text-primary tracking-wider mb-4">ABOUT THE MOVEMENT</p>
                <h3 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  What Is <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">True Happiness</span>?
                </h3>
                <p className="text-lg text-white/70 leading-relaxed">
                  It's not about winning. It's a celebration of <span className="font-semibold text-primary">joy, personal growth, and community impact</span>. Mr. and Mrs. Happiness recognizes ambassadors of positivity across all age groups—from 6 to 70+.
                </p>
              </div>
              <ul className="space-y-5">
                {[
                  { icon: Award, text: 'Scholarships & Corporate Awards', desc: 'Real rewards for real impact' },
                  { icon: Zap, text: 'Evidence-Based Recognition System', desc: 'Transparent and fair evaluation' },
                  { icon: Users, text: 'Community Impact Focus', desc: 'Building stronger communities' },
                  { icon: Heart, text: 'Non-Competitive Philosophy', desc: 'Everyone can win together' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start group cursor-pointer">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white group-hover:text-primary transition">{item.text}</p>
                      <p className="text-sm text-white/60 mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium Video Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 animate-pulse" />
              <GlassCard animated className="aspect-square flex items-center justify-center relative overflow-hidden backdrop-blur-xl border border-white/10">
                {/* Auto-playing Video */}
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                >
                  <source src="/intro.mp4" type="video/mp4" />
                </video>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40" />
                
                {/* Content overlay */}
                <div className="relative z-10 text-center space-y-4">
                  
                  
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      
         {/* Gallery Preview Section - Seamless Design */}
      <section id="gallery" className="py-32 relative overflow-visible" data-scroll-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 animate-slideUp space-y-4">
            <p className="text-sm font-semibold text-secondary tracking-wider">COMMUNITY STORIES</p>
            <h3 className="text-5xl md:text-6xl font-bold text-white mb-4">Happiness Gallery</h3>
            <p className="text-lg text-white/70 mb-8">Discover inspiring stories from our community</p>
            <Link href="/gallery">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:shadow-2xl hover:scale-105 text-white border-0 h-14 px-10 text-lg group relative overflow-hidden">
                <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                View Full Gallery <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 px-2">
            {[
              {
                id: 1,
                quote: 'Every moment of happiness is a celebration of life itself.',
              },
              {
                id: 2,
                quote: 'Finding joy in simple moments is the key to true happiness.',
              },
              {
                id: 3,
                quote: 'Happiness grows when shared with those around you.',
              },
              {
                id: 4,
                quote: 'The greatest gift we can give ourselves is permission to be happy.',
              },
              {
                id: 5,
                quote: 'True happiness comes from within, not from external achievements.',
              },
              {
                id: 6,
                quote: 'Life is beautiful when you learn to celebrate every milestone.',
              },
            ].map((story, index) => (
              <InteractiveGalleryCard
                key={story.id}
                id={story.id}
                imageUrl="/image.png"
                videoUrl="/miss.mp4"
                quote={story.quote}
                delay={index}
              />
            ))}
          </div>
        </div>
      </section>

    

      {/* Categories Section - Seamless Design */}
      <section id="categories" className="py-32 relative overflow-hidden" data-scroll-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-24 animate-slideUp space-y-4">
            <p className="text-sm font-semibold text-secondary tracking-wider">AGE CATEGORIES</p>
            <h3 className="text-5xl md:text-6xl font-bold text-white">For Everyone</h3>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Age 6 to 70+ – find your happiness category and begin your journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Junior Joy', age: '6-12 years', icon: '🌟', color: 'from-blue-400/30', gradient: 'from-blue-400' },
              { name: 'Teenager Triumph', age: '13-18 years', icon: '⭐', color: 'from-purple-400/30', gradient: 'from-purple-400' },
              { name: 'Youth Radiance', age: '19-25 years', icon: '✨', color: 'from-pink-400/30', gradient: 'from-pink-400' },
              { name: 'Emerging Adults', age: '26-35 years', icon: '🌸', color: 'from-rose-400/30', gradient: 'from-rose-400' },
              { name: 'Prime Happiness', age: '36-49 years', icon: '🌺', color: 'from-orange-400/30', gradient: 'from-orange-400' },
              { name: "Seenager's Gleam", age: '50+ years', icon: '💎', color: 'from-amber-400/30', gradient: 'from-amber-400' },
            ].map((cat, i) => (
              <div key={i} className="group relative">
                <div className={`absolute -inset-1 bg-gradient-to-br ${cat.color} to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000`} />
                <GlassCard
                  className={`group/cat hover-lift bg-gradient-to-br ${cat.color} to-transparent backdrop-blur-xl border border-white/10 relative overflow-hidden`}
                  animated
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-white/5 opacity-0 group-hover/cat:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 space-y-4">
                    <div className="text-7xl mb-4 group-hover/cat:scale-125 transition-transform duration-300">{cat.icon}</div>
                    <div>
                      <h4 className="text-2xl font-bold text-white group-hover/cat:text-primary transition">{cat.name}</h4>
                      <p className="text-white/70 mt-1 font-medium">{cat.age}</p>
                    </div>
                    <div className="h-1 w-16 bg-gradient-to-r from-primary to-secondary rounded-full opacity-0 group-hover/cat:opacity-100 transition-opacity duration-500" />
                  </div>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Section - Seamless Design */}
      <section id="journey" className="py-32 relative overflow-hidden" data-scroll-reveal>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24 animate-slideUp space-y-4">
            <p className="text-sm font-semibold text-primary tracking-wider">YOUR PATHWAY</p>
            <h3 className="text-5xl md:text-6xl font-bold text-white">Your Happiness Journey</h3>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Follow the guided pipeline from signup to public recognition
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 relative">
            {/* Background Image Layer - Hidden by default, shown on hover */}
            {[
              { image: '/registration.png', color: 'from-blue-500' },
              { image: '/profile.png', color: 'from-purple-500' },
              { image: '/passport.png', color: 'from-pink-500' },
              { image: '/submit.png', color: 'from-amber-500' },
              { image: '/celebrate.png', color: 'from-rose-500' },
            ].map((item, i) => (
              <div 
                key={i}
                className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/journey:opacity-30 pointer-events-none rounded-xl overflow-hidden`}
              >
                <img
                  src={item.image}
                  alt="Background"
                  className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} to-transparent opacity-50`} />
              </div>
            ))}

            {[
              { step: '1', title: 'Register', desc: 'Create account & select category', icon: Users, color: 'from-blue-500', image: '/registration.png' },
              { step: '2', title: 'Profile', desc: 'Complete your details & interests', icon: Target, color: 'from-purple-500', image: '/profile.png' },
              { step: '3', title: 'Passport', desc: 'Log daily happiness entries', icon: Heart, color: 'from-pink-500', image: '/passport.png' },
              { step: '4', title: 'Submit', desc: 'Upload evidence & get verified', icon: Award, color: 'from-amber-500', image: '/submit.png' },
              { step: '5', title: 'Celebrate', desc: 'Share & earn recognition', icon: Trophy, color: 'from-rose-500', image: '/celebrate.png' },
            ].map((journey, i) => (
              <div key={i} className="relative animate-slideUp group/journey" style={{ animationDelay: `${i * 0.1}s` }}>
                {/* Card */}
                <div className="relative overflow-hidden rounded-xl">
                  <div className={`absolute -inset-1 bg-gradient-to-r ${journey.color} to-transparent rounded-xl blur opacity-0 group-hover/journey:opacity-100 transition duration-1000 z-20`} />
                  <div className="relative h-48 w-full overflow-hidden rounded-xl border border-white/10 group/card hover-lift">
                    {/* Background Image - Covers Whole Card on Hover */}
                    <div className="absolute inset-0 z-0">
                      <img
                        src={journey.image}
                        alt={journey.title}
                        className="w-full h-full object-cover opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 scale-100 group-hover/card:scale-110"
                      />
                      {/* Dark overlay on hover to keep text readable */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                      {/* Base backdrop */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 to-slate-900/60 group-hover/card:opacity-0 transition-opacity duration-500" />
                    </div>
                    
                    {/* Content - Always on top */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center py-8 px-4 text-center">
                      {/* Image Circle at Number Position - Hidden on hover */}
                      <div className="relative mb-4 opacity-100 group-hover/card:opacity-0 transition-opacity duration-300">
                        <div className={`absolute -inset-1 bg-gradient-to-r ${journey.color} to-transparent rounded-full blur-lg opacity-0 group-hover/card:opacity-0 transition-all duration-700`} />
                        <div className={`relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 transition-all duration-500`}>
                          <img
                            src={journey.image}
                            alt={journey.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Step Number Badge */}
                      <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br ${journey.color} to-transparent flex items-center justify-center text-white font-bold text-xs z-20`}>
                        {journey.step}
                      </div>
                      
                      <h4 className="text-lg font-semibold text-white mb-2 group-hover/card:text-white transition">{journey.title}</h4>
                      <p className="text-sm text-white/60 group-hover/card:text-white/90 transition">{journey.desc}</p>
                    </div>
                  </div>
                </div>
                {i < 4 && (
                  <div className="hidden md:block absolute top-1/2 -right-2 w-4 h-1 bg-gradient-to-r from-primary to-secondary transform -translate-y-1/2 group-hover/journey:w-6 transition-all duration-300" style={{ opacity: 0.3 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    

      {/* Premium Final CTA Section - Seamless Design */}
      <section className="py-32 relative overflow-hidden" data-scroll-reveal>
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8 relative z-10">
          <div className="group relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/40 via-secondary/40 to-primary/40 rounded-2xl blur-2xl opacity-40 group-hover:opacity-60 transition duration-1000" />
            <GlassCard className="space-y-8 relative backdrop-blur-xl border border-white/10 py-12 px-8 md:px-16">
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  <Star className="w-6 h-6 text-primary animate-float" />
                  <Star className="w-6 h-6 text-secondary animate-float" style={{ animationDelay: '0.2s' }} />
                  <Star className="w-6 h-6 text-primary animate-float" style={{ animationDelay: '0.4s' }} />
                </div>
                <h3 className="text-5xl md:text-6xl font-bold text-white">
                  Ready to Share Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Happiness</span>?
                </h3>
                <p className="text-lg text-white/70">
                  Join thousands of happiness ambassadors. Start your 80-day transformation journey today.
                </p>
              </div>
              {!isAuthenticated && (
                <Link href="/auth/login">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:shadow-2xl hover:scale-105 text-white border-0 h-14 px-10 text-lg group/btn relative overflow-hidden">
                    <span className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                    Begin Your Journey <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              )}
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="border-t border-white/10 py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-5 gap-12 mb-16">
            <div className="space-y-4">
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                  <Crown className="w-5 h-5" />
                </div>
                <span className="font-bold text-white group-hover:text-primary transition">Mr & Mrs Happiness</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">Celebrating joy, community, and personal growth across all age groups.</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-white">Platform</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li><a href="#" className="hover:text-primary transition relative group">How it works<span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" /></a></li>
                <li><a href="#" className="hover:text-primary transition relative group">Categories<span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" /></a></li>
                <li><a href="#gallery" className="hover:text-primary transition relative group">Gallery<span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" /></a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-white">Resources</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li><a href="#" className="hover:text-primary transition relative group">Guidelines<span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" /></a></li>
                <li><a href="#" className="hover:text-primary transition relative group">FAQ<span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" /></a></li>
                <li><a href="#" className="hover:text-primary transition relative group">Rules<span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" /></a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-white">Legal</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li><a href="#" className="hover:text-primary transition relative group">Privacy<span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" /></a></li>
                <li><a href="#" className="hover:text-primary transition relative group">Terms<span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" /></a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-white">Community</h4>
              <ul className="space-y-2 text-white/70 text-sm">
                <li><a href="#" className="hover:text-primary transition relative group">Twitter<span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" /></a></li>
                <li><a href="#" className="hover:text-primary transition relative group">Instagram<span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" /></a></li>
                <li><a href="#" className="hover:text-primary transition relative group">Contact<span className="absolute bottom-0 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" /></a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-white/60 text-sm">
            <p>&copy; 2024 Mr. & Mrs. Happiness™. All rights reserved. | Celebrating joy, one story at a time.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
