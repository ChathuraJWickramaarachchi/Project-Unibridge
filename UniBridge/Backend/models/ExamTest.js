import mongoose from 'mongoose';

const examTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an exam title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    timeLimit: {
      type: Number,
      required: [true, 'Please add a time limit'],
      min: [1, 'Time limit must be at least 1 minute']
    },
    passingScore: {
      type: Number,
      required: [true, 'Please add a passing score'],
      min: [0, 'Passing score cannot be negative'],
      max: [100, 'Passing score cannot exceed 100']
    },
    totalMarks: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for question count
examTestSchema.virtual('questionCount').get(function() {
  return this._questionCount || 0;
});

export default mongoose.model('ExamTest', examTestSchema);
