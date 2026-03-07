'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass-card'
import { ArrowLeft, Heart, BookOpen, Smile, Users, Eye, Target, Award, GraduationCap, Lightbulb } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logomrms.png" alt="Mr. & Miss Happiness" className="w-10 h-10 object-contain" />
            <span className="font-bold text-white group-hover:text-primary transition">Mr & Mrs Happiness</span>
          </Link>
          <Link href="/">
            <Button variant="outline" className="bg-transparent border-white/20 text-white hover:text-primary hover:border-primary">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* Hero */}
        <section className="text-center space-y-6">
          <p className="text-sm font-semibold text-primary tracking-wider uppercase">About Us</p>
          <h1 className="text-5xl md:text-6xl font-black leading-tight">
            Ellipsis of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Happiness</span>
          </h1>
          <p className="text-lg text-white/70 max-w-3xl mx-auto leading-relaxed">
            A non-profit organization dedicated to nurturing happiness and well-being within communities.
          </p>
        </section>

        {/* Main About */}
        <section className="space-y-8">
          <GlassCard className="backdrop-blur-xl border border-white/10 space-y-6">
            <p className="text-white/80 leading-relaxed">
              Ellipsis of Happiness is a non-profit organization dedicated to nurturing happiness and well-being within communities. We aim to achieve this through innovative happiness workshops, empowering scholarships for students, meaningful community engagement, and cutting-edge well-being research and advocacy.
            </p>
            <p className="text-white/80 leading-relaxed">
              Our foundation is built on the belief that happiness is not just an emotion but a way of life that can be cultivated and shared. Our team comprises passionate volunteers, advisors, and supporters who believe in the power of collective action to bring about meaningful change. We are committed to empowering individuals and communities to lead happier, healthier lives by fostering a culture of well-being, resilience, and connection.
            </p>
            <p className="text-white/80 leading-relaxed">
              At Ellipsis of Happiness, we understand the importance of a holistic approach to well-being. That's why we focus on the mental, emotional, and physical aspects of happiness. Our initiatives are designed to be inclusive, ensuring that everyone, regardless of age, background, or circumstance, can participate and benefit from our programs.
            </p>
            <p className="text-white/80 leading-relaxed">
              We invite you to join us on this journey toward building conscious communities where happiness is not just an aspiration but a reality. Together, we can make a lasting impact on the world, one smile at a time.
            </p>
          </GlassCard>
        </section>

        {/* Ellipsis Meaning */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold text-secondary tracking-wider uppercase">The Three Dots</p>
            <h2 className="text-4xl font-bold">
              Ellipsis of{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Happiness</span>
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Ellipsis represents the &ldquo;three dots,&rdquo; symbolizing the core pillars of our foundation—Education, Playfulness, and Community Empowerment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Education',
                desc: 'Lays the groundwork, providing essential knowledge for a fulfilling life.',
                color: 'from-blue-500/20',
              },
              {
                icon: Smile,
                title: 'Playfulness',
                desc: 'Infuses life with joy, making learning engaging and fun for everyone.',
                color: 'from-pink-500/20',
              },
              {
                icon: Users,
                title: 'Community Empowerment',
                desc: 'Connects and strengthens, ensuring that happiness is shared and sustainable.',
                color: 'from-amber-500/20',
              },
            ].map((pillar, i) => (
              <GlassCard
                key={i}
                className={`backdrop-blur-xl border border-white/10 bg-gradient-to-br ${pillar.color} to-transparent space-y-4 text-center`}
                animated
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto">
                  <pillar.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{pillar.desc}</p>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="backdrop-blur-xl border border-white/10">
            <p className="text-white/80 leading-relaxed text-center">
              Together, these pillars help us bridge outer happiness with inner well-being, creating a holistic approach to a fulfilling life. At Ellipsis of Happiness, we aim to educate, inspire, and empower individuals to achieve physical, mental, and spiritual health through joyful, experiential, and engaging ways, recognizing the profound significance of conscious community living.
            </p>
          </GlassCard>
        </section>

        {/* Vision & Mission */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold text-primary tracking-wider uppercase">Our Purpose</p>
            <h2 className="text-4xl font-bold text-white">Vision & Mission</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard className="backdrop-blur-xl border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white">Vision</h3>
              </div>
              <p className="text-white/80 leading-relaxed">
                Promoting holistic happiness and well-being for all.
              </p>
            </GlassCard>

            <GlassCard className="backdrop-blur-xl border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white">Mission</h3>
              </div>
              <p className="text-white/80 leading-relaxed">
                Our mission is to promote holistic happiness and well-being for students, teachers and community by enhancing physical, mental, and spiritual health practices. We aim to empower through innovative well-being programs, research, educational initiatives, and strategic partnerships that foster a balanced and thriving life.
              </p>
            </GlassCard>
          </div>
        </section>

        {/* Objectives */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold text-secondary tracking-wider uppercase">What We Do</p>
            <h2 className="text-4xl font-bold text-white">Our Objectives</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Lightbulb,
                text: 'To increase awareness for mental health, happiness & well-being among students, teachers and community.',
              },
              {
                icon: GraduationCap,
                text: 'To promote existing happiness and well-being education through scholarships & research.',
              },
              {
                icon: Award,
                text: 'To deliver happiness and well-being hybrid training programs, happiness workshops cum events, lectures, conferences, debates, and exhibitions.',
              },
              {
                icon: Heart,
                text: 'To enhance community engagement by impactful initiatives.',
              },
            ].map((obj, i) => (
              <GlassCard key={i} className="backdrop-blur-xl border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <obj.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-white/80 leading-relaxed">{obj.text}</p>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold text-primary tracking-wider uppercase">Leadership</p>
            <h2 className="text-4xl font-bold text-white">Our Team</h2>
            <p className="text-white/70">Director | Advisory Board | Partners</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {[
              {
                name: 'Ms. Rumy Arora',
                qualification: 'MBA, BCA',
                role: 'Director',
              },
              {
                name: 'Nitin Arora',
                qualification: 'Ph.D., M.B.A., B.E. Chemical',
                role: 'Director',
              },
            ].map((member, i) => (
              <GlassCard key={i} className="backdrop-blur-xl border border-white/10 text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center mx-auto">
                  <Users className="w-10 h-10 text-primary/70" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{member.name}</h3>
                  <p className="text-primary text-sm font-semibold">{member.role}</p>
                  <p className="text-white/60 text-sm mt-1">{member.qualification}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-6 text-center">
          <GlassCard className="backdrop-blur-xl border border-white/10 space-y-6 py-10">
            <h2 className="text-3xl font-bold text-white">Get In Touch</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-white/70">
              <a href="mailto:nitin.arora@mrandmisshappiness.in" className="hover:text-primary transition">
                nitin.arora@mrandmisshappiness.in
              </a>
              <span className="hidden sm:inline text-white/30">|</span>
              <a href="mailto:nitin.arora@ehappinessfoundation.in" className="hover:text-primary transition">
                nitin.arora@ehappinessfoundation.in
              </a>
              <span className="hidden sm:inline text-white/30">|</span>
              <a href="mailto:info.eohf@gmail.com" className="hover:text-primary transition">
                info.eohf@gmail.com
              </a>
            </div>
            <Link href="/">
              <Button className="bg-gradient-to-r from-primary to-secondary text-white hover:shadow-2xl hover:scale-105 h-12 px-8">
                Back to Home
              </Button>
            </Link>
          </GlassCard>
        </section>
      </div>
    </div>
  )
}
