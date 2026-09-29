/**
 * resetAdmin.js — Run once to force-reset the admin user's password & ensure active status.
 * Usage: node server/resetAdmin.js
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uniheal';
const ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@uniheal.edu';
const ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

await mongoose.connect(MONGODB_URI);
console.log('✅ Connected to MongoDB');

// Get the raw users collection to bypass Mongoose middleware
const db = mongoose.connection.db;
const users = db.collection('users');

const newHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

const result = await users.findOneAndUpdate(
  { email: ADMIN_EMAIL },
  {
    $set: {
      password: newHash,
      role: 'admin',
      status: 'active',
    },
  },
  { returnDocument: 'after', upsert: true }
);

if (result) {
  console.log(`✅ Admin password reset successfully for: ${ADMIN_EMAIL}`);
  console.log(`   Role:   ${result.role}`);
  console.log(`   Status: ${result.status}`);
} else {
  console.log('⚠️  Admin user not found — a new one was upserted.');
}

// Verify it works
const verify = await bcrypt.compare(ADMIN_PASSWORD, newHash);
console.log(`✅ Password verification test: ${verify ? 'PASS' : 'FAIL'}`);

await mongoose.disconnect();
console.log('Done. You can now log in with:');
console.log(`  Email:    ${ADMIN_EMAIL}`);
console.log(`  Password: ${ADMIN_PASSWORD}`);
process.exit(0);
