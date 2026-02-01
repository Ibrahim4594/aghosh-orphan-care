const pg = require('pg');

const pool = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_TwogcNhO3bk9@ep-bitter-silence-addquu6r-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

(async () => {
  try {
    console.log('Adding attendance_status column to event_donations table...\n');

    await pool.query(`
      ALTER TABLE event_donations
      ADD COLUMN IF NOT EXISTS attendance_status text DEFAULT 'attending'
    `);

    console.log('✓ attendance_status column added successfully\n');

    await pool.end();
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
