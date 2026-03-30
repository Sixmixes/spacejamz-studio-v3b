import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { streamerId, amount, trackId, streamerStripeAccountId } = body;

        if (!streamerId || !amount || !trackId) {
            return NextResponse.json({ error: 'Missing required parameters: streamerId, amount, trackId are required.' }, { status: 400 });
        }

        // IMPORTANT: In a production environment, you should NOT trust the client to provide the `streamerStripeAccountId`.
        // You should fetch the streamer's user document securely via Firebase Admin SDK and extract their connected Stripe Account ID.
        const connectedAccountId = streamerStripeAccountId || process.env.NEXT_PUBLIC_MOCK_STREAMER_ACCOUNT_ID;

        if (!connectedAccountId) {
            return NextResponse.json({ error: 'Streamer Stripe Account ID is missing or not configured.' }, { status: 400 });
        }

        const tokenPriceInCents = 100; // $1.00 per Bump Token
        const totalAmountInCents = amount * tokenPriceInCents;
        const platformFeeInCents = Math.round(totalAmountInCents * 0.20); // 20% platform fee

        // Create the Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${amount} Bump Token${amount > 1 ? 's' : ''}`,
                            description: `Priority bump in ${streamerId}'s live SpaceJamz queue.`,
                            images: ['https://spacejamz.com/bump-token-icon.png'], // Replace with actual token icon
                        },
                        unit_amount: tokenPriceInCents,
                    },
                    quantity: amount,
                },
            ],
            mode: 'payment',
            // --- THE 80/20 SPLIT LOGIC ---
            payment_intent_data: {
                application_fee_amount: platformFeeInCents,
                transfer_data: {
                    destination: connectedAccountId,
                },
            },
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/studio?streamerId=${streamerId}&success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/studio?streamerId=${streamerId}&canceled=true`,
            metadata: {
                streamerId,
                trackId,
                bumpTokens: amount.toString(),
                type: 'bump_token_purchase'
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
