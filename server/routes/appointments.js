import express from 'express';
import Appointment from '../models/Appointment.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

// Get appointments based on role
router.get('/', async (req, res) => {
  try {
    const { role, _id } = req.user;
    let appointments;

    if (role === 'student') {
      appointments = await Appointment.find({ student: _id }).sort({ createdAt: -1 });
    } else if (role === 'counsellor') {
      appointments = await Appointment.find({
        $or: [{ counselor: _id }, { status: 'pending' }],
      }).sort({ createdAt: -1 });
    } else if (role === 'admin') {
      appointments = await Appointment.find().sort({ createdAt: -1 });
    }

    res.json({ appointments: appointments || [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments', error: err.message });
  }
});

// Create new appointment (Student only or Admin)
router.post('/', async (req, res) => {
  try {
    const { date, time, urgency, concerns, counselorId, counselorName } = req.body;

    if (!date || !time) {
      return res.status(400).json({ message: 'Date and time are required for booking.' });
    }

    const appointment = new Appointment({
      student: req.user._id,
      studentName: req.user.name,
      studentId: req.user.studentId || '',
      studentEmail: req.user.email,
      counselor: counselorId || null,
      counselorName: counselorName || 'Assigned Counselor',
      date,
      time,
      urgency: urgency || 'normal',
      concerns: concerns || '',
      status: 'pending',
    });

    await appointment.save();
    res.status(201).json({ message: 'Appointment booked successfully.', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create appointment', error: err.message });
  }
});

// Update appointment status (Counselor / Admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    if (req.user.role === 'counsellor' && !appointment.counselor) {
      appointment.counselor = req.user._id;
      appointment.counselorName = req.user.name;
    }

    await appointment.save();
    res.json({ message: 'Appointment updated successfully', appointment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update appointment', error: err.message });
  }
});

export default router;
