import Razorpay from 'razorpay'
import crypto from 'crypto'
import { Payment } from '@/lib/models'
import { sendPaymentConfirmationEmail } from '@/lib/email'
import connectDB from '@/lib/mongodb'

// Lazily initialize Razorpay to avoid runtime errors during import/build
let razorpay: Razorpay | null = null
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || ''

function getRazorpay(): Razorpay {
  if (razorpay) return razorpay

  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET

  if (!key_id || !key_secret) {
    throw new Error('Razorpay credentials are not configured')
  }

  razorpay = new Razorpay({
    key_id,
    key_secret,
  })

  return razorpay
}

interface CreateOrderParams {
  userId: string
  amount: number
  currency?: string
  receipt: string
  notes?: Record<string, string>
}

interface VerifySignatureParams {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

// Create payment order
export async function createOrder(params: CreateOrderParams): Promise<{
  success: boolean
  orderId?: string
  amount?: number
  currency?: string
  error?: string
}> {
  try {
    await connectDB()

    const { userId, amount, currency = 'INR', receipt, notes = {} } = params

    // Create order in Razorpay
    const order = await getRazorpay().orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt,
      notes: {
        userId,
        ...notes,
      },
    })

    // Save payment record to database
    await Payment.create({
      userId,
      razorpayOrderId: order.id,
      amount: amount * 100,
      currency,
      status: 'pending',
    })

    console.log(`✅ Razorpay order created: ${order.id}`)

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    }
  } catch (error) {
    console.error('❌ Razorpay order creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment order',
    }
  }
}

// Verify payment signature
export async function verifySignature(params: VerifySignatureParams): Promise<{
  success: boolean
  verified?: boolean
  error?: string
}> {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params

    // Create signature verification
    const body = `${razorpayOrderId}|${razorpayPaymentId}`
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex')

    const isSignatureValid = expectedSignature === razorpaySignature

    if (!isSignatureValid) {
      console.error('❌ Invalid payment signature for order:', razorpayOrderId)
      return { success: true, verified: false }
    }

    // Update payment status in database
    await connectDB()
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'completed',
        verifiedAt: new Date(),
      },
      { new: true }
    )

    if (payment) {
      // Send confirmation email
      const { User } = await import('@/lib/models')
      const user = await User.findById(payment.userId)
      
      if (user) {
        await sendPaymentConfirmationEmail(
          user.email,
          user.name,
          payment.amount,
          payment.razorpayPaymentId || razorpayPaymentId
        )
      }
    }

    console.log(`✅ Payment verified: ${razorpayPaymentId}`)

    return { success: true, verified: true }
  } catch (error) {
    console.error('❌ Payment verification error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify payment',
    }
  }
}

// Handle webhook events
export async function handleWebhookEvent(event: {
  event: string
  payload: Record<string, any>
}): Promise<{ success: boolean; error?: string }> {
  try {
    await connectDB()

    const { event: eventName, payload } = event

    switch (eventName) {
      case 'payment.captured':
        await handlePaymentCaptured(payload)
        break
      
      case 'payment.failed':
        await handlePaymentFailed(payload)
        break
      
      case 'order.paid':
        await handleOrderPaid(payload)
        break
      
      default:
        console.log(`Unhandled webhook event: ${eventName}`)
    }

    return { success: true }
  } catch (error) {
    console.error('❌ Webhook handling error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Webhook handling failed',
    }
  }
}

// Handle payment captured event
async function handlePaymentCaptured(payload: any) {
  const { id: razorpayPaymentId, order_id: razorpayOrderId } = payload.payment

  await Payment.findOneAndUpdate(
    { razorpayOrderId },
    {
      razorpayPaymentId,
      status: 'completed',
      verifiedAt: new Date(),
    }
  )

  console.log(`✅ Payment captured: ${razorpayPaymentId}`)
}

// Handle payment failed event
async function handlePaymentFailed(payload: any) {
  const { id: razorpayPaymentId, order_id: razorpayOrderId, error } = payload.payment

  await Payment.findOneAndUpdate(
    { razorpayOrderId },
    {
      razorpayPaymentId,
      status: 'failed',
    }
  )

  console.log(`❌ Payment failed: ${razorpayPaymentId}`, error?.description)
}

// Handle order paid event
async function handleOrderPaid(payload: any) {
  const { id: razorpayOrderId } = payload.order

  await Payment.findOneAndUpdate(
    { razorpayOrderId },
    { status: 'completed' }
  )

  console.log(`✅ Order paid: ${razorpayOrderId}`)
}

// Verify webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex')

    return signature === expectedSignature
  } catch (error) {
    console.error('❌ Webhook signature verification error:', error)
    return false
  }
}

// Refund payment
export async function refundPayment(
  paymentId: string,
  amount?: number
): Promise<{
  success: boolean
  refundId?: string
  error?: string
}> {
  try {
    await connectDB()

    const payment = await Payment.findOne({ razorpayPaymentId: paymentId })
    if (!payment) {
      return { success: false, error: 'Payment not found' }
    }

    const refund = await getRazorpay().refunds.create({
      payment_id: paymentId,
      amount: amount || payment.amount, // Full refund by default
      currency: payment.currency,
    })

    await Payment.findByIdAndUpdate(payment._id, {
      status: 'refunded',
    })

    console.log(`✅ Refund processed: ${refund.id}`)

    return { success: true, refundId: refund.id }
  } catch (error) {
    console.error('❌ Refund error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Refund failed',
    }
  }
}

// Get payment details
export async function getPaymentDetails(orderId: string): Promise<any | null> {
  try {
    await connectDB()
    return await Payment.findOne({ razorpayOrderId: orderId })
  } catch (error) {
    console.error('❌ Error fetching payment details:', error)
    return null
  }
}

// Get user's payment history
export async function getUserPaymentHistory(userId: string): Promise<any[]> {
  try {
    await connectDB()
    return await Payment.find({ userId }).sort({ createdAt: -1 })
  } catch (error) {
    console.error('❌ Error fetching payment history:', error)
    return []
  }
}

export default {
  razorpay,
  createOrder,
  verifySignature,
  handleWebhookEvent,
  verifyWebhookSignature,
  refundPayment,
  getPaymentDetails,
  getUserPaymentHistory,
}

