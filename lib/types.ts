// User & Auth
export type UserRole = 'guest' | 'participant' | 'parent' | 'volunteer' | 'intern' | 'corporate' | 'sponsor' | 'director' | 'admin' | 'superadmin'
export type AgeCategory = 'junior' | 'teen' | 'youth' | 'emerging' | 'prime' | 'seenager'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  roles: UserRole[]
  category?: AgeCategory
  registrationStatus: 'pending' | 'approved' | 'rejected'
  happinessPassportCount: number
  verifiedEntriesCount: number
  createdAt: Date
  updatedAt: Date
  profileImage?: string
  bio?: string
}

// Gallery & Media
export interface MediaItem {
  id: string
  userId: string
  type: 'photo' | 'video'
  url: string
  caption: string
  verified: boolean
  createdAt: Date
}

// Contestant Profile
export interface ContestantProfile {
  id: string
  userId: string
  userName: string
  category: string
  shortBio: string
  profileImage: string
  verifiedHappinessEntries: number
  galleryItems: string[]
  slug: string
}

// Happiness Passport
export interface HappinessEntry {
  id: string
  userId: string
  date: Date
  entry: string
  mediaUrls?: string[]
  verified: boolean
  adminNotes?: string
  createdAt: Date
}

// Registration
export interface Registration {
  id: string
  userId: string
  category: AgeCategory
  status: 'draft' | 'submitted' | 'locked'
  formData: Record<string, any>
  lockedUntil?: Date
  submittedAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Payment
export interface Payment {
  id: string
  userId: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  razorpayOrderId?: string
  razorpayPaymentId?: string
  createdAt: Date
}

// Admin
export interface AdminSubmission {
  id: string
  userId: string
  type: 'registration' | 'passport' | 'media'
  status: 'pending' | 'approved' | 'rejected'
  content: any
  reviewedBy?: string
  reviewedAt?: Date
  notes?: string
  createdAt: Date
}
