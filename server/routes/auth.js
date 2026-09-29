import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Login for all roles (Student, Counsellor, Admin)
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, studentId, password, role } = req.body;
    const loginInput = identifier || email || studentId;

    if (!loginInput || !password) {
      return res.status(400).json({ message: 'Username/Email/Student ID and password are required.' });
    }

    // Search by email or studentId (case-insensitive)
    const query = {
      $or: [
        { email: loginInput.toLowerCase().trim() },
        { studentId: loginInput.trim() },
      ],
    };

    if (role) {
      query.role = role;
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid credentials. Please verify your details or contact your Administrator.' 
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ 
        message: 'Your account has been deactivated. Please contact the administrator.' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password. Please try again.' });
    }

    const secret = process.env.JWT_SECRET || 'uniheal_secret_jwt_key_2025';
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        specialization: user.specialization,
        phone: user.phone,
        status: user.status,
        avatar: user.avatar || '',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during authentication', error: err.message });
  }
});

// Get currently authenticated user profile
router.get('/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
