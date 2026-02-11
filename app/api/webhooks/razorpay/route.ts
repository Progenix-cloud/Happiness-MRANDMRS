import { NextRequest, NextResponse } from 'next/server'
import { handleWebhookEvent, verifyWebhookSignature } from '@/lib/razorpay'

// POST /api/webhooks/razorpay - Handle Razorpay webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature') || ''

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = JSON.parse(body)

    console.log(`📥 Webhook received: ${event.event}`)

    // Handle the event
    const result = await handleWebhookEvent(event)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

