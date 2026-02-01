const pg = require('pg');
const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

(async () => {
  try {
    console.log('Fetching sponsorships with missing Stripe receipt URLs...\n');

    // Get all sponsorships with payment intent IDs but no receipt URLs
    const result = await pool.query(
      `SELECT id, sponsor_name, monthly_amount, stripe_payment_intent_id
       FROM sponsorships
       WHERE stripe_payment_intent_id IS NOT NULL
         AND stripe_receipt_url IS NULL
         AND payment_status = 'completed'`
    );

    console.log(`Found ${result.rows.length} sponsorships missing receipt URLs\n`);

    for (const row of result.rows) {
      console.log(`Processing: ${row.sponsor_name} (PKR ${row.monthly_amount})`);
      console.log(`  Payment Intent ID: ${row.stripe_payment_intent_id}`);

      try {
        // Fetch payment intent with charge details
        const paymentIntent = await stripe.paymentIntents.retrieve(row.stripe_payment_intent_id, {
          expand: ['latest_charge']
        });

        if (paymentIntent.latest_charge && paymentIntent.latest_charge.receipt_url) {
          const receiptUrl = paymentIntent.latest_charge.receipt_url;

          // Update database with receipt URL
          await pool.query(
            'UPDATE sponsorships SET stripe_receipt_url = $1 WHERE id = $2',
            [receiptUrl, row.id]
          );

          console.log(`  ✓ Updated receipt URL: ${receiptUrl.substring(0, 60)}...`);
        } else {
          console.log(`  ⚠ Receipt URL not available yet (payment might still be processing)`);
        }
      } catch (err) {
        console.log(`  ✗ Error fetching receipt: ${err.message}`);
      }

      console.log('');
    }

    await pool.end();
    console.log('Done! All available Stripe receipt URLs have been fetched.');
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
