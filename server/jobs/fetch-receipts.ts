/**
 * Background job to fetch missing Stripe receipt URLs
 * Run this periodically (e.g., every hour) to ensure all sponsorships have receipt URLs
 */

import { db } from '../db';
import { sponsorships } from '../../shared/schema';
import { eq, and, isNotNull, isNull } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-01-27.acacia' as any,
});

export async function fetchMissingReceiptURLs() {
  console.log('[Receipt Job] Starting...');

  try {
    if (!db) {
      console.log('[Receipt Job] Database not configured, skipping...');
      return;
    }
    // Find sponsorships with payment intent IDs but no receipt URLs
    const missingReceipts = await db
      .select()
      .from(sponsorships)
      .where(
        and(
          isNotNull(sponsorships.stripePaymentIntentId),
          isNull(sponsorships.stripeReceiptUrl),
          eq(sponsorships.paymentStatus, 'completed')
        )
      );

    console.log(`[Receipt Job] Found ${missingReceipts.length} sponsorships missing receipt URLs`);

    let successCount = 0;
    let failCount = 0;

    for (const sponsorship of missingReceipts) {
      try {
        console.log(`[Receipt Job] Fetching receipt for payment intent: ${sponsorship.stripePaymentIntentId}`);

        const paymentIntent = await stripe.paymentIntents.retrieve(
          sponsorship.stripePaymentIntentId!,
          { expand: ['latest_charge'] }
        );

        if (paymentIntent.latest_charge && typeof paymentIntent.latest_charge === 'object') {
          const receiptUrl = paymentIntent.latest_charge.receipt_url;

          if (receiptUrl) {
            await db
              .update(sponsorships)
              .set({ stripeReceiptUrl: receiptUrl })
              .where(eq(sponsorships.id, sponsorship.id));

            console.log(`[Receipt Job] ✓ Updated receipt URL for sponsorship ${sponsorship.id}`);
            successCount++;
          } else {
            console.log(`[Receipt Job] ⚠ No receipt URL available yet for ${sponsorship.id}`);
            failCount++;
          }
        }
      } catch (error) {
        console.error(`[Receipt Job] ✗ Error fetching receipt for ${sponsorship.id}:`, error);
        failCount++;
      }
    }

    console.log(`[Receipt Job] Complete: ${successCount} success, ${failCount} failed`);
  } catch (error) {
    console.error('[Receipt Job] Fatal error:', error);
  }
}

// If run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`.replace(/\\/g, '/')) {
  fetchMissingReceiptURLs()
    .then(() => {
      console.log('[Receipt Job] Done');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[Receipt Job] Fatal error:', error);
      process.exit(1);
    });
}
