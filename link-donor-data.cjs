/**
 * Migration Script: Link Old Donations and Sponsorships to Donor Accounts
 *
 * This script updates existing donations, sponsorships, and event donations
 * to link them to donor accounts based on matching email addresses.
 *
 * Run: node link-donor-data.cjs
 */

const { Client } = require('pg');
require('dotenv').config();

async function linkDonorData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // 1. Link donations to donors by email
    console.log('\n📊 Linking donations to donor accounts...');
    const donationsResult = await client.query(`
      UPDATE donations d
      SET donor_id = donors.id
      FROM donors
      WHERE d.email = donors.email
        AND d.donor_id IS NULL
        AND d.email IS NOT NULL
      RETURNING d.id, d.email, d.amount;
    `);

    console.log(`✓ Linked ${donationsResult.rowCount} donations to donor accounts`);
    if (donationsResult.rowCount > 0) {
      console.log('  Updated donations:');
      donationsResult.rows.forEach(row => {
        console.log(`    - ID: ${row.id}, Email: ${row.email}, Amount: PKR ${row.amount}`);
      });
    }

    // 2. Link sponsorships to donors by email
    console.log('\n💝 Linking sponsorships to donor accounts...');
    const sponsorshipsResult = await client.query(`
      UPDATE sponsorships s
      SET donor_id = donors.id
      FROM donors
      WHERE s.sponsor_email = donors.email
        AND s.donor_id IS NULL
        AND s.sponsor_email IS NOT NULL
      RETURNING s.id, s.sponsor_email, s.sponsor_name, s.monthly_amount;
    `);

    console.log(`✓ Linked ${sponsorshipsResult.rowCount} sponsorships to donor accounts`);
    if (sponsorshipsResult.rowCount > 0) {
      console.log('  Updated sponsorships:');
      sponsorshipsResult.rows.forEach(row => {
        console.log(`    - ID: ${row.id}, Email: ${row.sponsor_email}, Name: ${row.sponsor_name}, Amount: PKR ${row.monthly_amount}/month`);
      });
    }

    // 3. Link event donations to donors by email
    console.log('\n🎉 Linking event donations to donor accounts...');
    const eventDonationsResult = await client.query(`
      UPDATE event_donations ed
      SET donor_id = donors.id
      FROM donors
      WHERE ed.donor_email = donors.email
        AND ed.donor_id IS NULL
        AND ed.donor_email IS NOT NULL
      RETURNING ed.id, ed.donor_email, ed.donor_name, ed.amount;
    `);

    console.log(`✓ Linked ${eventDonationsResult.rowCount} event donations to donor accounts`);
    if (eventDonationsResult.rowCount > 0) {
      console.log('  Updated event donations:');
      eventDonationsResult.rows.forEach(row => {
        console.log(`    - ID: ${row.id}, Email: ${row.donor_email}, Name: ${row.donor_name}, Amount: PKR ${row.amount}`);
      });
    }

    // 4. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total donations linked:       ${donationsResult.rowCount}`);
    console.log(`Total sponsorships linked:    ${sponsorshipsResult.rowCount}`);
    console.log(`Total event donations linked: ${eventDonationsResult.rowCount}`);
    console.log(`Total records updated:        ${donationsResult.rowCount + sponsorshipsResult.rowCount + eventDonationsResult.rowCount}`);
    console.log('='.repeat(60));

    // 5. Show current donor stats
    console.log('\n👥 Donor Account Statistics:');
    const statsResult = await client.query(`
      SELECT
        donors.email,
        donors.full_name,
        COUNT(DISTINCT donations.id) as total_donations,
        COALESCE(SUM(donations.amount), 0) as total_donation_amount,
        COUNT(DISTINCT sponsorships.id) as total_sponsorships,
        COALESCE(SUM(CASE WHEN sponsorships.status = 'active' THEN sponsorships.monthly_amount ELSE 0 END), 0) as monthly_sponsorship_amount,
        COUNT(DISTINCT event_donations.id) as total_event_donations
      FROM donors
      LEFT JOIN donations ON donations.donor_id = donors.id
      LEFT JOIN sponsorships ON sponsorships.donor_id = donors.id
      LEFT JOIN event_donations ON event_donations.donor_id = donors.id
      GROUP BY donors.id, donors.email, donors.full_name
      HAVING COUNT(donations.id) > 0 OR COUNT(sponsorships.id) > 0 OR COUNT(event_donations.id) > 0
      ORDER BY donors.created_at DESC;
    `);

    if (statsResult.rowCount > 0) {
      console.log('\nDonors with linked records:');
      statsResult.rows.forEach(row => {
        console.log(`\n  📧 ${row.email} (${row.full_name})`);
        console.log(`     Donations: ${row.total_donations} (PKR ${parseInt(row.total_donation_amount).toLocaleString()})`);
        console.log(`     Sponsorships: ${row.total_sponsorships} (PKR ${parseInt(row.monthly_sponsorship_amount).toLocaleString()}/month)`);
        console.log(`     Event Donations: ${row.total_event_donations}`);
      });
    } else {
      console.log('  No donors found with linked records.');
    }

    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✓ Database connection closed');
  }
}

// Run the migration
linkDonorData();
