import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

function getCredentials() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!secretKey || !publishableKey) {
    return null;
  }

  return {
    publishableKey,
    secretKey,
  };
}

export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PUBLISHABLE_KEY);
}

export async function getUncachableStripeClient(): Promise<Stripe> {
  const credentials = getCredentials();

  if (!credentials) {
    throw new Error('STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY must be set in .env file');
  }

  return new Stripe(credentials.secretKey, {
    apiVersion: '2024-12-18.acacia' as any,
  });
}

export async function getStripeClient(): Promise<Stripe> {
  if (!stripeInstance) {
    stripeInstance = await getUncachableStripeClient();
  }
  return stripeInstance;
}

export async function getStripePublishableKey(): Promise<string> {
  const credentials = getCredentials();

  if (!credentials) {
    throw new Error('STRIPE_PUBLISHABLE_KEY must be set in .env file');
  }

  return credentials.publishableKey;
}

export async function getStripeSecretKey(): Promise<string> {
  const credentials = getCredentials();

  if (!credentials) {
    throw new Error('STRIPE_SECRET_KEY must be set in .env file');
  }

  return credentials.secretKey;
}

// Webhook signature verification
export async function verifyWebhookSignature(
  payload: Buffer,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET must be set in .env file for webhook verification');
  }

  const stripe = await getStripeClient();
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
