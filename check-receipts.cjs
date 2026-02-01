const pg = require('pg');

const pool = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_TwogcNhO3bk9@ep-bitter-silence-addquu6r-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

(async () => {
  try {
    const result = await pool.query(
      'SELECT sponsor_name, monthly_amount, payment_method, stripe_payment_intent_id, stripe_receipt_url FROM sponsorships WHERE donor_id = $1 AND status = $2 ORDER BY created_at DESC',
      ['e5df316b-fadc-43a8-8544-a8de3763fe25', 'active']
    );

    console.log('Your Active Sponsorships:');
    console.log('========================\n');

    result.rows.forEach((r, i) => {
      console.log(`${i + 1}. ${r.sponsor_name} - PKR ${r.monthly_amount}/month`);
      console.log(`   Payment: ${r.payment_method}`);
      console.log(`   Stripe Receipt: ${r.stripe_receipt_url ? '✓ Available' : '✗ Missing'}`);
      console.log('');
    });

    const withReceipts = result.rows.filter(r => r.stripe_receipt_url).length;
    const total = result.rows.length;

    console.log(`\nSummary: ${withReceipts}/${total} sponsorships have Stripe receipt URLs\n`);

    await pool.end();
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
