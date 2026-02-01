const pg = require('pg');

const pool = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_TwogcNhO3bk9@ep-bitter-silence-addquu6r-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

(async () => {
  try {
    console.log('Creating database indexes for faster queries...\n');

    // Create indexes
    const indexes = [
      {
        name: 'donations_donor_id_idx',
        sql: 'CREATE INDEX IF NOT EXISTS "donations_donor_id_idx" ON "donations" USING btree ("donor_id")'
      },
      {
        name: 'sponsorships_donor_id_idx',
        sql: 'CREATE INDEX IF NOT EXISTS "sponsorships_donor_id_idx" ON "sponsorships" USING btree ("donor_id")'
      },
      {
        name: 'sponsorships_child_id_idx',
        sql: 'CREATE INDEX IF NOT EXISTS "sponsorships_child_id_idx" ON "sponsorships" USING btree ("child_id")'
      },
      {
        name: 'sponsorships_status_idx',
        sql: 'CREATE INDEX IF NOT EXISTS "sponsorships_status_idx" ON "sponsorships" USING btree ("status")'
      }
    ];

    for (const index of indexes) {
      console.log(`Creating index: ${index.name}...`);
      await pool.query(index.sql);
      console.log(`✓ ${index.name} created`);
    }

    await pool.end();
    console.log('\n✓ All indexes created successfully! Queries should be faster now.');
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
