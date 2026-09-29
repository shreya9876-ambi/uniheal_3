import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import appointmentRoutes from './routes/appointments.js';
import counsellorRoutes from './routes/counsellors.js';
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
app.use('/api/counsellors', counsellorRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Seed default Admin & Initial Counsellors if none exist
async function seedDefaultData() {
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

    const counsellorCount = await User.countDocuments({ role: 'counsellor' });
    if (counsellorCount === 0) {
      const defaultCounsellors = [
        {
          name: 'Dr. Sarah Jenkins',
          email: 'sarah.jenkins@uniheal.edu',
          password: 'password123',
          role: 'counsellor',
          department: 'Mental Health & Wellbeing',
          specialization: 'Cognitive Behavioral Therapy (CBT) & Anxiety',
          phone: '+1 (555) 234-5678',
          officeLocation: 'Student Wellness Hub, Suite 301',
          bio: 'Licensed clinical psychologist with 8+ years experience helping university students manage academic pressure, generalized anxiety, and panic disorder.',
          status: 'active',
          sessionModes: ['In-Person', 'Online Video Call', 'Confidential Phone'],
          availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            timeSlots: [
              '09:00 AM - 10:00 AM',
              '10:30 AM - 11:30 AM',
              '02:00 PM - 03:00 PM',
              '03:30 PM - 04:30 PM',
            ],
          },
        },
        {
          name: 'Dr. Marcus Vance',
          email: 'marcus.vance@uniheal.edu',
          password: 'password123',
          role: 'counsellor',
          department: 'Student Psychological Services',
          specialization: 'Stress Management & Depression Support',
          phone: '+1 (555) 345-6789',
          officeLocation: 'East Campus Counseling Center, Office 12B',
          bio: 'Specialist in student life transitions, depression intervention, emotional resilience, and mindfulness meditation practices.',
          status: 'active',
          sessionModes: ['In-Person', 'Online Video Call'],
          availability: {
            days: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
            timeSlots: [
              '10:00 AM - 11:00 AM',
              '11:30 AM - 12:30 PM',
              '01:30 PM - 02:30 PM',
              '04:00 PM - 05:00 PM',
            ],
          },
        },
        {
          name: 'Dr. Priya Sharma',
          email: 'priya.sharma@uniheal.edu',
          password: 'password123',
          role: 'counsellor',
          department: 'Counseling & Life Skills',
          specialization: 'Burnout Prevention & Relationship Guidance',
          phone: '+1 (555) 456-7890',
          officeLocation: 'Health Center, Level 2, Room 204',
          bio: 'Compassionate counselor focused on peer dynamics, burnout, self-esteem building, and confidential one-on-one sessions.',
          status: 'active',
          avatar: '/counsellor-priya.jpg',
          sessionModes: ['In-Person', 'Online Video Call', 'Confidential Phone'],
          availability: {
            days: ['Tuesday', 'Wednesday', 'Thursday'],
            timeSlots: [
              '09:30 AM - 10:30 AM',
              '11:00 AM - 12:00 PM',
              '02:00 PM - 03:00 PM',
              '03:30 PM - 04:30 PM',
            ],
          },
        },
      ];

      for (const c of defaultCounsellors) {
        const cUser = new User(c);
        await cUser.save();
      }
      console.log('✅ Default Counsellors seeded successfully.');
    } else {
      // Update any existing Dr. Priya Sharma record to have the portrait avatar
      await User.updateMany(
        { $or: [{ name: /Priya/i }, { email: /priya/i }] },
        { $set: { avatar: '/counsellor-priya.jpg' } }
      );
    }

    // Seed default Demo Student if none exists
    const demoStudentExists = await User.findOne({
      $or: [
        { studentId: 'STU-2025-01' },
        { email: 'student@uniheal.edu' },
      ],
    });
    if (!demoStudentExists) {
      const demoStudent = new User({
        name: 'Aarav Patel',
        email: 'student@uniheal.edu',
        studentId: 'STU-2025-01',
        password: 'password123',
        role: 'student',
        department: 'Computer Science & Engineering',
        phone: '+91 98765 43210',
        status: 'active',
      });
      await demoStudent.save();
      console.log('✅ Demo Student seeded: STU-2025-01 / student@uniheal.edu (Password: password123)');
    }
  } catch (err) {
    console.error('Error seeding initial data:', err.message);
  }
}

// Connect to MongoDB & Start Server
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully.');
    await seedDefaultData();
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
