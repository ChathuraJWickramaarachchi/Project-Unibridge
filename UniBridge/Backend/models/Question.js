import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamTest',
      required: [true, 'Please select an exam']
    },
    text: {
      type: String,
      required: [true, 'Please add question text'],
      trim: true,
      maxlength: [500, 'Question text cannot exceed 500 characters']
    },
    options: {
      type: [String],
      required: [true, 'Please add all 4 options'],
      validate: {
        validator: function(v) {
          return v.length === 4;
        },
        message: 'Must have exactly 4 options'
      }
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Please select the correct answer'],
      enum: [0, 1, 2, 3],
      message: 'Correct answer must be between 0 and 3'
    },
    marks: {
      type: Number,
      required: [true, 'Please add marks for the question'],
      min: [1, 'Marks must be at least 1'],
      default: 1
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
questionSchema.index({ examId: 1 });

export default mongoose.model('Question', questionSchema);
