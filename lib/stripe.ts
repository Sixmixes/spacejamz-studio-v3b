import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is missing. Stripe will not throw an error until an API call is made. Please add it to your .env');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-03-25.dahlia',
  appInfo: {
    name: 'SpaceJamz Studio',
    version: '3.0.0',
  },
});
