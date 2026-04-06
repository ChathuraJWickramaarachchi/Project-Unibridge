const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    enum: ['IT', 'Software Engineering', 'Quality Assurance', 'Human Resources', 'Networking'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Department description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    default: 'Building2'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

departmentSchema.virtual('internshipCount', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'departmentId',
  count: true,
  match: { type: 'Internship' }
});

departmentSchema.virtual('jobCount', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'departmentId',
  count: true,
  match: { type: 'Permanent' }
});

departmentSchema.virtual('totalPositions', {
  ref: 'Job',
  localField: '_id',
  foreignField: 'departmentId',
  count: true
});

module.exports = mongoose.model('Department', departmentSchema);
