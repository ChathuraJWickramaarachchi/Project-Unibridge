import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required']
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamTest',
      required: [true, 'Exam ID is required']
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [0, 'Score cannot be negative']
    },
    status: {
      type: String,
      enum: ['PASS', 'FAIL'],
      required: [true, 'Status is required']
    },
    totalQuestions: {
      type: Number,
      required: [true, 'Total questions is required'],
      min: [0, 'Total questions cannot be negative']
    },
    correctAnswers: {
      type: Number,
      required: [true, 'Correct answers count is required'],
      min: [0, 'Correct answers cannot be negative']
    },
    percentage: {
      type: Number,
      default: 0,
      min: [0, 'Percentage cannot be negative'],
      max: [100, 'Percentage cannot exceed 100']
    },
    duration: {
      type: Number,
      default: 0,
      description: 'Time taken in minutes'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate results for the same student and exam
// Create a unique compound index
resultSchema.index(
  { studentId: 1, examId: 1 },
  { unique: true, name: 'unique_student_exam' }
);

// Index for sorting by submission date
resultSchema.index({ submittedAt: -1 });

// Index for finding results by student
resultSchema.index({ studentId: 1 });

// Index for finding results by exam
resultSchema.index({ examId: 1 });

export default mongoose.model('Result', resultSchema);
