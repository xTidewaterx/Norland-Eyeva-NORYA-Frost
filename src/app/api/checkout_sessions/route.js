import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const headersList = headers();
    const origin = headersList.get('origin') || 'https://localhost:3000';

    const requestBody = await req.json();

    console.log("Received request body:", requestBody);

    // ✅ Map default_price_id to Stripe's expected price key
    const completedLineItemArray = requestBody.map(({ default_price_id, quantity }) => ({
      price: default_price_id,
      quantity,
    }));

    console.log("Completed line items array:", completedLineItemArray);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: completedLineItemArray,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
    });

    console.log("Session URL:", session.url);
    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error('Error creating session:', err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}