const mongoose = require('mongoose');

const applicantExamSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamTest',
      required: true
    },
    applicantEmail: {
      type: String,
      required: [true, 'Applicant email is required'],
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question'
        },
        selectedAnswer: {
          type: Number,
          enum: [0, 1, 2, 3, -1], // -1 means not answered
          default: -1
        },
        isCorrect: Boolean,
        marksObtained: {
          type: Number,
          default: 0
        }
      }
    ],
    score: {
      type: Number,
      default: 0,
      min: 0
    },
    totalMarks: {
      type: Number,
      default: 0
    },
    passFail: {
      type: String,
      enum: ['pass', 'fail'],
      default: 'fail'
    },
    percentage: {
      type: Number,
      default: 0
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    endedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['started', 'submitted', 'evaluated'],
      default: 'started'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
applicantExamSchema.index({ examId: 1, applicantEmail: 1 });

module.exports = mongoose.model('ApplicantExam', applicantExamSchema);
