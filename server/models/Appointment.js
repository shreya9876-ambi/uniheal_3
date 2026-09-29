import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
    default: '',
  },
  studentEmail: {
    type: String,
    default: '',
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  counselorName: {
    type: String,
    default: 'Unassigned',
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  urgency: {
    type: String,
    enum: ['normal', 'moderate', 'high', 'critical'],
    default: 'normal',
  },
  concerns: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
