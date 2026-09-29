import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import appointmentRoutes from './routes/appointments.js';
import User from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uniheal';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Seed default Admin if no admin exists
async function seedDefaultAdmin() {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const defaultAdmin = new User({
        name: 'System Administrator',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@uniheal.edu',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        department: 'Administration',
        status: 'active',
      });
      await defaultAdmin.save();
      console.log('✅ Default Admin created: admin@uniheal.edu (Password: admin123)');
    }
  } catch (err) {
    console.error('Error seeding default admin:', err.message);
  }
}

// Connect to MongoDB & Start Server
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully.');
    await seedDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`🚀 UniHeal Backend Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️  Please check your MONGODB_URI in .env file.');
    // Start server anyway so health check and descriptive error messages can be served
    app.listen(PORT, () => {
      console.log(`🚀 Server started in fallback mode on http://localhost:${PORT} (Waiting for MongoDB connection)`);
    });
  });

export default app;
