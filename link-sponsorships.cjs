const pg = require('pg');

const pool = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_TwogcNhO3bk9@ep-bitter-silence-addquu6r-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

(async () => {
  try {
    // Get ali's donor ID
    const donorResult = await pool.query('SELECT id, email FROM donors WHERE email = $1', ['ali@gmail.com']);

    if (donorResult.rows.length === 0) {
      console.log('Donor ali@gmail.com not found');
      await pool.end();
      return;
    }

    const donorId = donorResult.rows[0].id;
    console.log('Found donor:', donorResult.rows[0].email, 'ID:', donorId);

    // Update all sponsorships to link to this donor
    const updateResult = await pool.query(
      'UPDATE sponsorships SET donor_id = $1 WHERE donor_id IS NULL RETURNING id, sponsor_name, sponsor_email, monthly_amount',
      [donorId]
    );

    console.log('\nUpdated', updateResult.rows.length, 'sponsorships:');
    updateResult.rows.forEach(row => {
      console.log('- Child:', row.sponsor_name, '| Email:', row.sponsor_email, '| Amount: PKR', row.monthly_amount);
    });

    await pool.end();
    console.log('\n✓ Done! Refresh your dashboard to see the sponsorships.');
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
