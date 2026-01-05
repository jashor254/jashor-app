// src/app/api/mpesa/callback/route.js
import { verifyCallback } from '@/lib/payments/verifyCallback';

export async function POST(req) {
  try {
    const payload = await req.json();

    await verifyCallback(payload);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Mpesa callback error:', err);
    return new Response(
      JSON.stringify({ success: false }),
      { status: 500 }
    );
  }
}
