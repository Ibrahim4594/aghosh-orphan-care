const pg = require('pg');

const pool = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_TwogcNhO3bk9@ep-bitter-silence-addquu6r-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

(async () => {
  try {
    // Get donor ID
    const donorResult = await pool.query(
      'SELECT id FROM donors WHERE email = $1',
      ['ali@gmail.com']
    );

    const donorId = donorResult.rows[0].id;
    console.log('Donor ID:', donorId);

    // Link all sponsorships with ali@gmail.com that don't have a donor_id
    const result = await pool.query(
      'UPDATE sponsorships SET donor_id = $1 WHERE sponsor_email = $2 AND donor_id IS NULL RETURNING sponsor_name, monthly_amount',
      [donorId, 'ali@gmail.com']
    );

    console.log('\nLinked', result.rows.length, 'new sponsorships:');
    result.rows.forEach(r => {
      console.log('  -', r.sponsor_name, '| PKR', r.monthly_amount);
    });

    await pool.end();
    console.log('\nDone! Refresh your dashboard.');
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
