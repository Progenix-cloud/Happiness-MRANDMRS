'use client'

import { useState, useEffect, useCallback } from 'react'
import { CardContent, Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GlassCard } from '@/components/glass-card'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { CheckCircle2, ArrowLeft, Upload, Save, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const categories = [
  { value: 'junior-joy', label: 'Junior Joy' },
  { value: 'teenager-triumph', label: 'Teenager Triumph' },
  { value: 'youth-radiance', label: 'Youth Radiance' },
  { value: 'emerging-adult', label: 'Emerging Adult' },
  { value: 'prime-happiness', label: 'Prime Happiness' },
  { value: 'seenagers-gleam', label: "Seenager's Gleam" },
]

interface RegistrationData {
  category: string
  formData: {
    dateOfBirth?: string
    address?: string
    city?: string
    state?: string
    pincode?: string
    shortBio?: string
    whyParticipate?: string
    instagramHandle?: string
    facebookHandle?: string
  }
  status: string
}

export default function RegistrationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [registration, setRegistration] = useState<RegistrationData | null>(null)
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
    category: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    shortBio: '',
    whyParticipate: '',
    instagramHandle: '',
    facebookHandle: '',
  })

  // Fetch registration data
  const fetchRegistration = useCallback(async () => {
    try {
      const response = await fetch('/api/registration', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRegistration(data)
        setFormData(prev => ({
          ...prev,
          category: data.category || '',
          dateOfBirth: data.formData?.dateOfBirth || '',
          address: data.formData?.address || '',
          city: data.formData?.city || '',
          state: data.formData?.state || '',
          pincode: data.formData?.pincode || '',
          shortBio: data.formData?.shortBio || '',
          whyParticipate: data.formData?.whyParticipate || '',
          instagramHandle: data.formData?.instagramHandle || '',
          facebookHandle: data.formData?.facebookHandle || '',
        }))
      }
    } catch (error) {
      console.error('Failed to fetch registration:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }))
      fetchRegistration()
    }
  }, [user, fetchRegistration])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (submit: boolean = false) => {
    setIsSaving(true)
    
    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          category: formData.category,
          formData: {
            dateOfBirth: formData.dateOfBirth,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            shortBio: formData.shortBio,
            whyParticipate: formData.whyParticipate,
            instagramHandle: formData.instagramHandle,
            facebookHandle: formData.facebookHandle,
          },
          submit,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save registration')
      }

      if (submit) {
        alert('Registration submitted successfully!')
        router.push('/dashboard')
      } else {
        alert('Draft saved successfully!')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert(error instanceof Error ? error.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate progress
  const filledFields = [
    formData.fullName,
    formData.email,
    formData.phone,
    formData.dateOfBirth,
    formData.category,
    formData.address,
    formData.city,
    formData.state,
    formData.pincode,
    formData.shortBio,
    formData.whyParticipate,
  ].filter(Boolean).length
  const progressPercent = Math.round((filledFields / 11) * 100)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hover-lift">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gradient">Registration</h1>
              <p className="text-sm text-foreground/60">Complete your profile</p>
            </div>
          </div>
          {user?.registrationStatus === 'approved' && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600 font-semibold">Approved</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Card */}
        <GlassCard className="mb-8 bg-gradient-to-r from-primary/20 to-secondary/20 hover-lift" animated>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Registration Progress</h2>
              <p className="text-foreground/60 text-sm">Complete all sections to finish your registration</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gradient">{progressPercent}%</div>
              <p className="text-sm text-foreground/60">Complete</p>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </GlassCard>

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic details about yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  disabled
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Category</CardTitle>
            <CardDescription>Select your participation category based on your age</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formData.category && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground/80">
                  <strong>Selected:</strong> {categories.find(c => c.value === formData.category)?.label}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>Your residential details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your street address"
                required
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">PIN Code *</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="PIN Code"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio & Social */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bio & Social Media</CardTitle>
            <CardDescription>Tell us about yourself and your social presence</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shortBio">Short Bio *</Label>
              <Input
                id="shortBio"
                name="shortBio"
                value={formData.shortBio}
                onChange={handleInputChange}
                placeholder="Brief description about yourself (max 200 characters)"
                maxLength={200}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whyParticipate">Why do you want to participate? *</Label>
              <Input
                id="whyParticipate"
                name="whyParticipate"
                value={formData.whyParticipate}
                onChange={handleInputChange}
                placeholder="Share your motivation"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagramHandle">Instagram Handle</Label>
                <Input
                  id="instagramHandle"
                  name="instagramHandle"
                  value={formData.instagramHandle}
                  onChange={handleInputChange}
                  placeholder="@username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebookHandle">Facebook Profile</Label>
                <Input
                  id="facebookHandle"
                  name="facebookHandle"
                  value={formData.facebookHandle}
                  onChange={handleInputChange}
                  placeholder="Profile URL or username"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Section */}
        <GlassCard className="mb-8 bg-gradient-to-br from-green-500/10 to-blue-500/10 hover-lift" animated>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-foreground">Ready to Submit?</h3>
              <p className="text-foreground/60 text-sm">Review your information before submitting</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="glass hover:backdrop-blur-xl bg-transparent"
                onClick={() => handleSubmit(false)}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
                onClick={() => handleSubmit(true)}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

