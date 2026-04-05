const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  examDate: {
    type: String,
    required: true
  },
  examTime: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    enum: ['Aptitude', 'Technical', 'Interview'],
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Online', 'Physical'],
      required: true
    },
    address: {
      type: String,
      required: function() {
        return this.location.type === 'Physical';
      }
    }
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  instructions: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
examSchema.index({ companyId: 1, examDate: -1 });
examSchema.index({ studentIds: 1 });
examSchema.index({ jobId: 1 });

module.exports = mongoose.model('Exam', examSchema, 'exam_schedule');
