const pg = require('pg');
const Stripe = require('stripe');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

(async () => {
  try {
    // Get ali's donor account
    const donorResult = await pool.query(
      'SELECT id, email FROM donors WHERE email = $1 OR email = $2',
      ['ali@gmail.com', 'ibrahimsamad507@gmail.com']
    );

    if (donorResult.rows.length === 0) {
      console.log('Donor not found');
      await pool.end();
      return;
    }

    const donor = donorResult.rows[0];
    console.log('Found donor:', donor.email, 'ID:', donor.id);

    // Link ALL sponsorships with matching emails to this donor
    const updateResult = await pool.query(`
      UPDATE sponsorships
      SET donor_id = $1
      WHERE sponsor_email IN ('ali@gmail.com', 'ibrahimsamad507@gmail.com', 'we@gmail.com')
        OR sponsor_email LIKE '%ibrahim%'
      RETURNING id, sponsor_name, sponsor_email, monthly_amount, stripe_payment_intent_id
    `, [donor.id]);

    console.log('\nLinked', updateResult.rows.length, 'sponsorships:');

    for (const row of updateResult.rows) {
      console.log('\n- Sponsorship:', row.sponsor_name);
      console.log('  Email:', row.sponsor_email);
      console.log('  Amount: PKR', row.monthly_amount);

      // Fetch Stripe receipt if missing
      if (row.stripe_payment_intent_id) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(row.stripe_payment_intent_id, {
            expand: ['latest_charge']
          });

          const receiptUrl = paymentIntent.latest_charge?.receipt_url;
          if (receiptUrl) {
            await pool.query(
              'UPDATE sponsorships SET stripe_receipt_url = $1 WHERE id = $2',
              [receiptUrl, row.id]
            );
            console.log('  ✓ Updated Stripe receipt URL');
          }
        } catch (err) {
          console.log('  ⚠ Could not fetch Stripe receipt');
        }
      }
    }

    await pool.end();
    console.log('\n✓ All sponsorships linked! Refresh your dashboard.');
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
