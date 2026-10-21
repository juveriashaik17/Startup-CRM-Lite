import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import User from './models/User.js';
import Lead from './models/Lead.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env and root .env
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const sampleLeadsData = [
  {
    name: 'Aarav Sharma',
    company: 'Tata Consultancy Services',
    email: 'aarav.sharma@tcs.com',
    phone: '+91 98765 43210',
    value: 245000,
    status: 'Won',
    source: 'LinkedIn',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // ~4 months ago
  },
  {
    name: 'Priya Patel',
    company: 'Infosys Technologies',
    email: 'priya.patel@infosys.com',
    phone: '+91 87654 32109',
    value: 182000,
    status: 'Won',
    source: 'Referral',
    createdAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // ~3 months ago
  },
  {
    name: 'Vikram Nair',
    company: 'Wipro Limited',
    email: 'vikram.nair@wipro.com',
    phone: '+91 76543 21098',
    value: 95000,
    status: 'Proposal Sent',
    source: 'Website',
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // ~1 month ago
  },
  {
    name: 'Ananya Deshmukh',
    company: 'HCL Technologies',
    email: 'ananya.deshmukh@hcl.com',
    phone: '+91 65432 10987',
    value: 310000,
    status: 'Meeting Scheduled',
    source: 'Cold Call',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // current month
  },
  {
    name: 'Rohan Mehta',
    company: 'Tech Mahindra',
    email: 'rohan.mehta@techmahindra.com',
    phone: '+91 54321 09876',
    value: 125000,
    status: 'Contacted',
    source: 'LinkedIn',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // current month
  },
  {
    name: 'Sneha Reddy',
    company: 'Larsen & Toubro Infotech',
    email: 'sneha.reddy@lntinfotech.com',
    phone: '+91 43210 98765',
    value: 420000,
    status: 'Won',
    source: 'Email Campaign',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // current month
  },
  {
    name: 'Kabir Verma',
    company: 'Razorpay Software',
    email: 'kabir.verma@razorpay.com',
    phone: '+91 32109 87654',
    value: 175000,
    status: 'New',
    source: 'Website',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // current month
  },
  {
    name: 'Diya Sengupta',
    company: 'Swiggy Technologies',
    email: 'diya.sengupta@swiggy.in',
    phone: '+91 21098 76543',
    value: 88000,
    status: 'Lost',
    source: 'Other',
    createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000), // ~2 months ago
  },
  {
    name: 'Aditya Kulkarni',
    company: 'Zerodha Broking',
    email: 'aditya.kulkarni@zerodha.com',
    phone: '+91 10987 65432',
    value: 360000,
    status: 'Won',
    source: 'Referral',
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // last month
  },
  {
    name: 'Meera Iyer',
    company: 'Freshworks Inc',
    email: 'meera.iyer@freshworks.com',
    phone: '+91 99887 76655',
    value: 215000,
    status: 'Contacted',
    source: 'LinkedIn',
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), // current month
  },
];

async function seedDatabase() {
  console.log('\n============================================================');
  console.log('🌱 SEEDING STARTUP CRM LITE DATABASE');
  console.log('============================================================\n');

  try {
    const conn = await connectDB();
    if (!conn) {
      console.log('⚠️  Please configure a live MONGODB_URI in backend/.env to seed into MongoDB Atlas.');
      process.exit(0);
    }

    // 1. Find or create demo user
    const demoEmail = 'demo@startupcrm.com';
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      console.log(`Creating demo user: ${demoEmail}...`);
      demoUser = await User.create({
        name: 'Demo Admin',
        email: demoEmail,
        password: 'Password123!',
      });
      console.log('✅ Demo user created (password: Password123!)');
    } else {
      console.log(`Using existing demo user: ${demoEmail} (${demoUser._id})`);
    }

    // 2. Remove any previous demo leads for this user to avoid duplicates
    const deleteResult = await Lead.deleteMany({ owner: demoUser._id });
    console.log(`Cleared ${deleteResult.deletedCount} existing leads for demo user.`);

    // 3. Attach owner and insert new leads
    const leadsToInsert = sampleLeadsData.map((lead) => ({
      ...lead,
      owner: demoUser._id,
    }));

    const insertedLeads = await Lead.insertMany(leadsToInsert);
    console.log(`✅ Successfully seeded ${insertedLeads.length} leads for ${demoEmail}!\n`);

    console.log('Summary of seeded leads:');
    insertedLeads.forEach((l, i) => {
      console.log(`  ${i + 1}. [${l.status}] ${l.name} - ${l.company} (Value: $${l.value}, Source: ${l.source})`);
    });

    console.log('\n============================================================');
    console.log('🎉 SEED COMPLETED SUCCESSFULLY');
    console.log('============================================================\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedDatabase();
