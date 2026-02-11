'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass-card'
import { CreditCard, CheckCircle2, Clock, Zap, Shield, Award } from 'lucide-react'
import Link from 'next/link'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PaymentPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending')

  const handleRazorpayPayment = async () => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 500000, currency: 'INR' }),
      })

      const order = await response.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Mr & Mrs Happiness',
        description: 'Event Registration Fee',
        order_id: order.id,
        handler: async (response: any) => {
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          })

          if (verifyResponse.ok) {
            setPaymentStatus('completed')
          } else {
            setPaymentStatus('failed')
          }
        },
        prefill: {
          name: 'Your Name',
          email: 'your@email.com',
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentStatus('failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-gradient">Complete Payment</h1>
          </div>
          <p className="text-foreground/60">Secure your participation with a one-time registration fee</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Payment Status */}
        {paymentStatus === 'completed' && (
          <GlassCard className="mb-8 bg-gradient-to-br from-green-400 to-transparent/20 border-green-500/50 hover-lift" animated>
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">Payment Successful!</h2>
                <p className="text-foreground/70 mt-1">Your registration is now complete. You can begin your happiness journey.</p>
              </div>
            </div>
          </GlassCard>
        )}

        {paymentStatus === 'failed' && (
          <GlassCard className="mb-8 bg-gradient-to-br from-red-400 to-transparent/20 border-red-500/50 hover-lift" animated>
            <div className="flex items-center gap-4">
              <Clock className="w-12 h-12 text-red-600" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">Payment Failed</h2>
                <p className="text-foreground/70 mt-1">Please try again or contact support for assistance.</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Price Breakdown */}
        <GlassCard className="mb-8 hover-lift" animated>
          <h2 className="text-2xl font-bold text-foreground mb-6">Price Breakdown</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-foreground/70">Event Registration</span>
              <span className="font-semibold text-foreground">₹4,500</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-foreground/70">Platform Fee</span>
              <span className="font-semibold text-foreground">₹500</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-primary/10 px-4 rounded-lg">
              <span className="font-bold text-foreground">Total Amount</span>
              <span className="text-2xl font-bold text-gradient">₹5,000</span>
            </div>
          </div>

          {/* Payment Benefits */}
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-foreground mb-3">What's Included:</h3>
            <ul className="space-y-2">
              {[
                '80-day participation in Happiness event',
                'Access to Happiness Passport system',
                'Public contestant profile & gallery',
                'Evidence verification & admin review',
                'Certificate of participation',
                'Eligibility for awards & recognition',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-foreground/80">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            {paymentStatus === 'completed' ? (
              <div className="w-full py-3 px-4 bg-green-500/20 text-green-600 rounded-lg font-semibold text-center">
                ✓ Payment Already Completed
              </div>
            ) : (
              <>
                <Button
                  onClick={handleRazorpayPayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-xl text-white border-0 h-12 font-semibold hover-lift"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {isProcessing ? 'Processing...' : 'Pay with Razorpay (₹5,000)'}
                </Button>
                <p className="text-center text-sm text-foreground/60 flex items-center justify-center gap-2 mt-3">
                  <Shield className="w-4 h-4" />
                  Secure payment powered by Razorpay
                </p>
              </>
            )}
          </div>
        </GlassCard>

        {/* Security Info */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Shield, title: 'Secure', desc: '256-bit SSL encryption' },
            { icon: Award, title: 'Trusted', desc: 'Razorpay verified' },
            { icon: Zap, title: 'Instant', desc: 'Immediate confirmation' },
          ].map((info, i) => {
            const Icon = info.icon
            return (
              <GlassCard key={i} className="text-center hover-lift" animated style={{ animationDelay: `${i * 0.1}s` }}>
                <Icon className="w-8 h-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                <p className="text-sm text-foreground/60">{info.desc}</p>
              </GlassCard>
            )
          })}
        </div>

        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="outline" className="glass hover:backdrop-blur-xl bg-transparent">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
