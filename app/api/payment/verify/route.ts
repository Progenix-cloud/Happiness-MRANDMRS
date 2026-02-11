import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import { Payment, User } from '@/lib/models'
import { sendPaymentConfirmationEmail } from '@/lib/email'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || ''
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || ''

// POST /api/payment/verify - Verify Razorpay payment
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
    const tokenPayload = jwt.verify(token, NEXTAUTH_SECRET) as { userId: string }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json()

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      )
    }

    // Verify signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    const isSignatureValid = expectedSignature === razorpaySignature

    if (!isSignatureValid) {
      console.error('❌ Invalid payment signature for order:', razorpayOrderId)
      return NextResponse.json(
        { error: 'Payment verification failed - invalid signature' },
        { status: 401 }
      )
    }

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId, userId: tokenPayload.userId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'completed',
        verifiedAt: new Date(),
      },
      { new: true }
    )

    if (payment) {
      // Update user's registration status
      await User.findByIdAndUpdate(tokenPayload.userId, {
        registrationStatus: 'approved',
      })

      // Send confirmation email
      const user = await User.findById(tokenPayload.userId)
      if (user) {
        await sendPaymentConfirmationEmail(
          user.email,
          user.name,
          payment.amount,
          razorpayPaymentId
        )
      }
    }

    console.log(`✅ Payment verified: ${razorpayPaymentId}`)

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpayPaymentId,
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/payment/verify - Get payment status
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const payment = await Payment.findOne({
      razorpayOrderId: orderId,
      userId: payload.userId,
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      verifiedAt: payment.verifiedAt,
      createdAt: payment.createdAt,
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    console.error('Get payment status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

