import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Maintenance title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Maintenance description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  type: {
    type: String,
    enum: ['scheduled', 'urgent', 'emergency'],
    default: 'scheduled',
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
  },
  // Scheduling
  scheduledStartTime: {
    type: Date,
    required: [true, 'Scheduled start time is required'],
  },
  scheduledEndTime: {
    type: Date,
    required: [true, 'Scheduled end time is required'],
  },
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled',
  },
  // Maintenance Mode
  isMaintenanceMode: {
    type: Boolean,
    default: false,
  },
  // Target Audience
  affectedUsers: {
    type: [String],
    enum: ['all', 'student', 'employer'],
    default: ['all'],
  },
  // Notifications
  emailSent: {
    type: Boolean,
    default: false,
  },
  emailSentAt: Date,
  notificationSent: {
    type: Boolean,
    default: false,
  },
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
}, {
  timestamps: true,
});

// Index for efficient queries
maintenanceSchema.index({ status: 1, scheduledStartTime: 1 });
maintenanceSchema.index({ isMaintenanceMode: 1 });

// Virtual for checking if maintenance is currently active
maintenanceSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.status === 'active' || 
         (this.status === 'scheduled' && 
          now >= this.scheduledStartTime && 
          now <= this.scheduledEndTime);
});

// Method to activate maintenance mode
maintenanceSchema.methods.activateMaintenanceMode = async function() {
  this.isMaintenanceMode = true;
  this.status = 'active';
  await this.save();
};

// Method to deactivate maintenance mode
maintenanceSchema.methods.deactivateMaintenanceMode = async function() {
  this.isMaintenanceMode = false;
  this.status = 'completed';
  this.completedAt = new Date();
  await this.save();
};

// Method to cancel maintenance
maintenanceSchema.methods.cancel = async function(reason) {
  this.status = 'cancelled';
  this.isMaintenanceMode = false;
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  await this.save();
};

export default mongoose.model('Maintenance', maintenanceSchema);
