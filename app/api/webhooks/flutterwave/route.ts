// app/api/webhooks/flutterwave/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET!;
  const backendToken = process.env.SERVICE_API_TOKEN!; // Token to secure backend communication
  const signature = req.headers.get('verif-hash');

  // 1. Verify webhook signature
  if (!signature || signature !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Parse webhook payload
    let payload;
    const contentType = req.headers.get('content-type');

    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await req.text();
      const parsedData = Object.fromEntries(new URLSearchParams(formData));
      payload = parsedData.data ? JSON.parse(parsedData.data) : parsedData;
    } else {
      payload = await req.json();
    }

    // 3. Handle successful payment
    if (payload.event === 'charge.completed' && payload.data.status === 'successful') {
      const { amount, customer, tx_ref, flw_ref } = payload.data;

      // 4. Call backend to apply top-up
      const backendResponse = await fetch(`${process.env.BACKEND_URL}/user/top-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${backendToken}`, // Use server token
        },
        body: JSON.stringify({
          amount,
          transaction_reference: tx_ref,
          flutterwave_reference: flw_ref,
          email: customer.email,
        }),
      });

      if (!backendResponse.ok) {
        console.error('Backend responded with:', await backendResponse.text());
        throw new Error('Backend update failed');
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 400 });
  }
}
