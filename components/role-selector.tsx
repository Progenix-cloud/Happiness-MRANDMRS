'use client'

import { GlassCard } from './glass-card'
import { Users, Briefcase, Trophy, Zap, UserCog, Crown } from 'lucide-react'
import type { UserRole } from '@/lib/types'

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void
  selectedRole?: UserRole
}

const ROLES = [
  {
    id: 'participant' as UserRole,
    name: 'Participant',
    icon: Trophy,
    description: 'Join as a contestant',
    color: 'from-blue-400'
  },
  {
    id: 'volunteer' as UserRole,
    name: 'Volunteer',
    icon: Users,
    description: 'Help organize & support',
    color: 'from-green-400'
  },
  {
    id: 'corporate' as UserRole,
    name: 'Corporate',
    icon: Briefcase,
    description: 'Partner with awards',
    color: 'from-purple-400'
  },
  {
    id: 'sponsor' as UserRole,
    name: 'Sponsor',
    icon: Zap,
    description: 'Support financially',
    color: 'from-orange-400'
  },
  {
    id: 'director' as UserRole,
    name: 'Director',
    icon: UserCog,
    description: 'Regional leadership',
    color: 'from-pink-400'
  },
  {
    id: 'admin' as UserRole,
    name: 'Admin',
    icon: Crown,
    description: 'Platform management',
    color: 'from-red-400'
  },
]

export function RoleSelector({ onSelectRole, selectedRole }: RoleSelectorProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-foreground mb-3">Select Your Role</h2>
        <p className="text-foreground/70">Choose how you want to participate in happiness</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {ROLES.map((role) => {
          const Icon = role.icon
          const isSelected = selectedRole === role.id
          return (
            <GlassCard
              key={role.id}
              className={`cursor-pointer hover-lift transition-all ${isSelected ? 'ring-2 ring-primary' : ''} bg-gradient-to-br ${role.color} to-transparent/20`}
              onClick={() => onSelectRole(role.id)}
            >
              <Icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-xl font-semibold text-foreground mb-1">{role.name}</h3>
              <p className="text-sm text-foreground/60">{role.description}</p>
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <span className="text-xs font-semibold text-primary">Selected</span>
                </div>
              )}
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
