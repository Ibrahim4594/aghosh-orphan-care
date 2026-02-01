const pg = require('pg');

const pool = new pg.Pool({
  connectionString: 'postgresql://neondb_owner:npg_TwogcNhO3bk9@ep-bitter-silence-addquu6r-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

(async () => {
  try {
    console.log('Creating event_donations table...\n');

    // Create event_donations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "event_donations" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" varchar NOT NULL,
        "donor_id" varchar,
        "donor_name" text NOT NULL,
        "donor_email" text NOT NULL,
        "donor_phone" text,
        "amount" integer NOT NULL,
        "payment_method" text DEFAULT 'bank',
        "payment_status" text DEFAULT 'pending',
        "stripe_payment_intent_id" text,
        "stripe_receipt_url" text,
        "local_receipt_number" text,
        "notes" text,
        "created_at" timestamp DEFAULT now()
      )
    `);
    console.log('✓ event_donations table created');

    // Create indexes
    await pool.query('CREATE INDEX IF NOT EXISTS "event_donations_donor_id_idx" ON "event_donations" USING btree ("donor_id")');
    console.log('✓ donor_id index created');

    await pool.query('CREATE INDEX IF NOT EXISTS "event_donations_event_id_idx" ON "event_donations" USING btree ("event_id")');
    console.log('✓ event_id index created');

    await pool.end();
    console.log('\n✓ Event donations table created successfully!');
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
