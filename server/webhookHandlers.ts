import { verifyWebhookSignature, isStripeConfigured } from './stripeClient';
import { storage } from './storage';
import type Stripe from 'stripe';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    if (!isStripeConfigured()) {
      throw new Error('Stripe is not configured');
    }

    // Verify webhook signature and get the event
    const event = await verifyWebhookSignature(payload, signature);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'charge.succeeded':
        console.log('Charge succeeded:', event.data.object);
        break;

      case 'charge.refunded':
        console.log('Charge refunded:', event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private static async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    console.log('Payment intent succeeded:', paymentIntent.id);
    const metadata = paymentIntent.metadata || {};

    // Record the donation
    try {
      await storage.createDonation({
        donorName: metadata.donorName || 'Anonymous',
        email: metadata.donorEmail || null,
        amount: parseInt(metadata.pkrEquivalent || '0'),
        category: metadata.category as any || 'general',
        paymentMethod: 'card',
        isAnonymous: metadata.isAnonymous === 'true',
      });
      console.log('Donation recorded from payment intent:', paymentIntent.id);
    } catch (error) {
      console.error('Error recording donation from payment intent:', error);
    }
  }

  private static async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    console.log('Checkout session completed:', session.id);

    if (session.payment_status !== 'paid') {
      console.log('Session not paid, skipping donation record');
      return;
    }

    const metadata = session.metadata || {};

    // Record the donation
    try {
      await storage.createDonation({
        donorName: metadata.donorName || 'Anonymous',
        email: metadata.donorEmail || null,
        amount: parseInt(metadata.pkrEquivalent || '0'),
        category: metadata.category as any || 'general',
        paymentMethod: 'card',
        isAnonymous: metadata.isAnonymous === 'true',
      });
      console.log('Donation recorded from checkout session:', session.id);
    } catch (error) {
      console.error('Error recording donation from checkout session:', error);
    }
  }
}
