/**
 * setShreyaAdmin.js — Set shreya@gmail.com as the ONLY admin in MongoDB
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
const TARGET_EMAIL = 'shreya@gmail.com';
const TARGET_PASSWORD = 'shreya1805';

console.log('Connecting to MongoDB Atlas...');
await mongoose.connect(MONGODB_URI);
console.log('✅ Connected to MongoDB');

const db = mongoose.connection.db;
const users = db.collection('users');

// Remove or delete any other accounts with role 'admin'
const deleteOtherAdmins = await users.deleteMany({
  role: 'admin',
  email: { $ne: TARGET_EMAIL }
});
console.log(`🗑️ Removed ${deleteOtherAdmins.deletedCount} previous/other admin account(s).`);

// Hash password for shreya
const newHash = await bcrypt.hash(TARGET_PASSWORD, 10);

// Upsert Shreya as Admin
const result = await users.findOneAndUpdate(
  { email: TARGET_EMAIL },
  {
    $set: {
      name: 'Shreya',
      email: TARGET_EMAIL,
      password: newHash,
      role: 'admin',
      department: 'Administration',
      status: 'active',
      updatedAt: new Date(),
    },
    $setOnInsert: {
      createdAt: new Date(),
    }
  },
  { returnDocument: 'after', upsert: true }
);

console.log(`✅ Only Admin successfully configured:`);
console.log(`   Name:     ${result.name}`);
console.log(`   Email:    ${result.email}`);
console.log(`   Role:     ${result.role}`);
console.log(`   Status:   ${result.status}`);

// Verify comparePassword test
const isMatch = await bcrypt.compare(TARGET_PASSWORD, newHash);
console.log(`✅ Password verification test for "${TARGET_PASSWORD}": ${isMatch ? 'PASS' : 'FAIL'}`);

await mongoose.disconnect();
console.log('Done!');
process.exit(0);
