import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    cvData: {
      fullName: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      },
      education: {
        type: String,
        required: true
      },
      skills: {
        type: String,
        required: true
      },
      experience: {
        type: String,
        required: true
      },
      careerObjective: {
        type: String
      }
    },
    paymentDetails: {
      amount: {
        type: Number,
        required: true,
        default: 9.99
      },
      currency: {
        type: String,
        required: true,
        default: 'USD'
      },
      paymentMethod: {
        type: String,
        required: true,
        enum: ['card', 'paypal', 'stripe']
      },
      transactionId: {
        type: String,
        required: true,
        unique: true
      },
      paymentStatus: {
        type: String,
        required: true,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending'
      },
      cardLastFour: {
        type: String
      },
      paymentProvider: {
        type: String,
        required: true,
        default: 'stripe'
      }
    },
    downloadInfo: {
      downloadCount: {
        type: Number,
        default: 0
      },
      lastDownloadedAt: {
        type: Date
      },
      downloadUrl: {
        type: String
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
paymentSchema.index({ userId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ 'paymentDetails.paymentStatus': 1 });

// Generate unique transaction ID
paymentSchema.pre('save', function(next) {
  if (this.isNew && !this.paymentDetails.transactionId) {
    this.paymentDetails.transactionId = 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

export default mongoose.model('Payment', paymentSchema);
