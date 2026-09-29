import express from 'express';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Protect all admin routes
router.use(authenticateToken, requireRole('admin'));

// 1. Get all users (filter by role or search query)
router.get('/users', async (req, res) => {
  try {
    const { role, search, status } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving users', error: err.message });
  }
});

// 2. Admin creates new credentials for a student, counsellor, or admin
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, studentId, department, specialization, phone, bio, officeLocation, availability } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, Email, Password, and Role are required.' });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    // If role is student and studentId is provided, check uniqueness
    if (role === 'student' && studentId) {
      const existingStudentId = await User.findOne({ studentId: studentId.trim() });
      if (existingStudentId) {
        return res.status(400).json({ message: 'A student with this Student ID already exists.' });
      }
    }

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // will be hashed by User schema pre-save hook
      role,
      studentId: role === 'student' ? studentId?.trim() : undefined,
      department: department?.trim() || '',
      specialization: role === 'counsellor' ? specialization?.trim() : '',
      phone: phone?.trim() || '',
      bio: bio?.trim() || '',
      officeLocation: officeLocation?.trim() || undefined,
      availability: availability || undefined,
      status: 'active',
    });

    await newUser.save();

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
      user: newUser,
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Failed to create user credentials', error: err.message });
  }
});

// 3. Update user details or change password / status
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, status, department, specialization, phone, studentId, bio, officeLocation, availability } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: 'Email is already in use by another account.' });
      }
      user.email = email.toLowerCase().trim();
    }
    if (status) user.status = status;
    if (department !== undefined) user.department = department;
    if (specialization !== undefined) user.specialization = specialization;
    if (phone !== undefined) user.phone = phone;
    if (studentId !== undefined) user.studentId = studentId;
    if (bio !== undefined) user.bio = bio;
    if (officeLocation !== undefined) user.officeLocation = officeLocation;
    if (availability) user.availability = availability;

    if (password && password.trim() !== '') {
      user.password = password; // pre-save will re-hash
    }

    await user.save();
    res.json({ message: 'User updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

// 4. Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

// 5. Dynamic Platform Statistics
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCounsellors = await User.countDocuments({ role: 'counsellor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });

    res.json({
      metrics: {
        totalStudents,
        totalCounsellors,
        totalAdmins,
        totalAppointments,
        pendingAppointments,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch platform metrics', error: err.message });
  }
});

export default router;
