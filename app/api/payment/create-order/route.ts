import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import connectDB from '@/lib/mongodb'
import { createOrder } from '@/lib/razorpay'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''

// POST /api/payment/create-order - Create Razorpay payment order
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string }

    const { amount, registrationId } = await request.json()

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const result = await createOrder({
      userId: payload.userId,
      amount,
      currency: 'INR',
      receipt: `receipt_${registrationId || Date.now()}`,
      notes: {
        registrationId: registrationId || '',
      },
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create order' },
        { status: 500 }
      )
    }

    console.log(`✅ Payment order created for user: ${payload.userId}`)

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      amount: result.amount,
      currency: result.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

