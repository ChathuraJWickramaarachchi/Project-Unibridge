import mongoose from 'mongoose';

const examResultsSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, 'Student name is required']
    },
    studentEmail: {
      type: String,
      required: [true, 'Student email is required']
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamTest',
      required: false
    },
    examName: {
      type: String,
      required: [true, 'Exam name is required']
    },
    result: {
      type: String,
      enum: ['PASS', 'FAIL'],
      required: [true, 'Result is required']
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative']
    },
    percentage: {
      type: Number,
      required: [true, 'Percentage is required'],
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot exceed 100']
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'exam_results' // Explicitly set collection name
  }
);

// Index for efficient queries
examResultsSchema.index({ studentEmail: 1 });
examResultsSchema.index({ examName: 1 });
examResultsSchema.index({ result: 1 });
examResultsSchema.index({ submittedAt: -1 });

export default mongoose.model('ExamResult', examResultsSchema);