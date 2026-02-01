/**
 * Check Donor Data Script
 *
 * This script checks what data exists for a specific donor email
 *
 * Run: node check-donor-data.cjs <email>
 */

const { Client } = require('pg');
require('dotenv').config();

async function checkDonorData() {
  const email = process.argv[2] || 'ali@gmail.com';

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    // 1. Check if donor exists
    console.log(`🔍 Checking donor: ${email}\n`);
    const donorResult = await client.query(
      'SELECT * FROM donors WHERE email = $1',
      [email]
    );

    if (donorResult.rowCount === 0) {
      console.log('❌ Donor not found with this email');
      return;
    }

    const donor = donorResult.rows[0];
    console.log('✅ Donor found:');
    console.log(`   ID: ${donor.id}`);
    console.log(`   Name: ${donor.full_name}`);
    console.log(`   Email: ${donor.email}`);
    console.log(`   Created: ${donor.created_at}\n`);

    // 2. Check donations
    const donationsResult = await client.query(
      'SELECT * FROM donations WHERE donor_id = $1 ORDER BY created_at DESC',
      [donor.id]
    );
    console.log(`💰 Donations: ${donationsResult.rowCount}`);
    if (donationsResult.rowCount > 0) {
      donationsResult.rows.forEach((d, i) => {
        console.log(`   ${i + 1}. PKR ${d.amount} - ${d.category} - ${d.created_at}`);
      });
    }
    console.log();

    // 3. Check sponsorships
    const sponsorshipsResult = await client.query(
      'SELECT * FROM sponsorships WHERE donor_id = $1 ORDER BY created_at DESC',
      [donor.id]
    );
    console.log(`💝 Sponsorships: ${sponsorshipsResult.rowCount}`);
    if (sponsorshipsResult.rowCount > 0) {
      sponsorshipsResult.rows.forEach((s, i) => {
        console.log(`   ${i + 1}. Child ID: ${s.child_id} - PKR ${s.monthly_amount}/month - Status: ${s.status} - ${s.created_at}`);
      });
    }
    console.log();

    // 4. Check event donations
    const eventDonationsResult = await client.query(
      'SELECT * FROM event_donations WHERE donor_id = $1 ORDER BY created_at DESC',
      [donor.id]
    );
    console.log(`🎉 Event Donations: ${eventDonationsResult.rowCount}`);
    if (eventDonationsResult.rowCount > 0) {
      eventDonationsResult.rows.forEach((ed, i) => {
        console.log(`   ${i + 1}. Event: ${ed.event_id} - PKR ${ed.amount} - ${ed.created_at}`);
      });
    }
    console.log();

    // 5. Summary
    const totalDonationAmount = donationsResult.rows.reduce((sum, d) => sum + parseInt(d.amount || 0), 0);
    const totalSponsorshipAmount = sponsorshipsResult.rows
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + parseInt(s.monthly_amount || 0), 0);
    const totalEventDonationAmount = eventDonationsResult.rows.reduce((sum, ed) => sum + parseInt(ed.amount || 0), 0);

    console.log('=' .repeat(60));
    console.log('📊 SUMMARY FOR ' + donor.full_name.toUpperCase());
    console.log('='.repeat(60));
    console.log(`Total Donations:        ${donationsResult.rowCount} (PKR ${totalDonationAmount.toLocaleString()})`);
    console.log(`Active Sponsorships:    ${sponsorshipsResult.rows.filter(s => s.status === 'active').length} (PKR ${totalSponsorshipAmount.toLocaleString()}/month)`);
    console.log(`Event Donations:        ${eventDonationsResult.rowCount} (PKR ${totalEventDonationAmount.toLocaleString()})`);
    console.log(`Total Contributed:      PKR ${(totalDonationAmount + totalSponsorshipAmount + totalEventDonationAmount).toLocaleString()}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkDonorData();
