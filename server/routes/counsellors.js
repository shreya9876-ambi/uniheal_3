import express from 'express';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/counsellors
 * Public / Student directory of all registered, active counsellors
 */
router.get('/', async (req, res) => {
  try {
    const { search, department, specialization } = req.query;
    const filter = {
      role: 'counsellor',
      status: 'active',
    };

    if (department && department !== 'all') {
      filter.department = department;
    }
    if (specialization && specialization !== 'all') {
      filter.specialization = specialization;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    const counsellors = await User.find(filter)
      .select('-password')
      .sort({ name: 1 });

    res.json({ counsellors });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving counsellors directory', error: err.message });
  }
});

/**
 * GET /api/counsellors/:id
 * Retrieve details for a single counsellor
 */
router.get('/:id', async (req, res) => {
  try {
    const counsellor = await User.findOne({
      _id: req.params.id,
      role: 'counsellor',
      status: 'active',
    }).select('-password');

    if (!counsellor) {
      return res.status(404).json({ message: 'Counsellor not found or inactive.' });
    }

    res.json({ counsellor });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving counsellor details', error: err.message });
  }
});

/**
 * GET /api/counsellors/:id/booked-slots
 * Returns all booked times for a counsellor on a specific date (YYYY-MM-DD)
 */
router.get('/:id/booked-slots', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date parameter (YYYY-MM-DD) is required.' });
    }

    const appointments = await Appointment.find({
      counselor: id,
      date: date,
      status: { $in: ['pending', 'confirmed'] },
    }).select('time status');

    const bookedSlots = appointments.map((a) => a.time);

    res.json({
      date,
      counselorId: id,
      bookedSlots,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving booked slots', error: err.message });
  }
});

/**
 * PATCH /api/counsellors/my-schedule
 * Counsellor updates their own working schedule and availability
 */
router.patch('/my-schedule', authenticateToken, requireRole('counsellor'), async (req, res) => {
  try {
    const { days, timeSlots, bio, officeLocation, sessionModes, phone, department, specialization } = req.body;

    const counsellor = await User.findById(req.user._id);
    if (!counsellor) {
      return res.status(404).json({ message: 'Counsellor account not found.' });
    }

    if (days) counsellor.availability.days = days;
    if (timeSlots) counsellor.availability.timeSlots = timeSlots;
    if (bio !== undefined) counsellor.bio = bio;
    if (officeLocation !== undefined) counsellor.officeLocation = officeLocation;
    if (sessionModes) counsellor.sessionModes = sessionModes;
    if (phone !== undefined) counsellor.phone = phone;
    if (department !== undefined) counsellor.department = department;
    if (specialization !== undefined) counsellor.specialization = specialization;

    await counsellor.save();

    res.json({
      message: 'Schedule and profile updated successfully',
      counsellor: counsellor.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update counsellor schedule', error: err.message });
  }
});

export default router;
