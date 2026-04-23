import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeGoogleOAuth } from './config/passport.js';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Load env vars
dotenv.config();

const app = express();

// Initialize Passport with Google OAuth strategy
import passport from 'passport';
initializeGoogleOAuth();
app.use(passport.initialize());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware - allow all localhost ports for development
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow any localhost origin
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      return callback(null, true);
    }
    
    // Allow specific origins
    const allowedOrigins = [process.env.CLIENT_URL || 'http://localhost:5173'];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

console.log('Loading routes...');
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import feedbackRoutes from './routes/feedback.js';
import departmentRoutes from './routes/departments.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import notificationRoutes from './routes/notifications.js';
import examRoutes from './routes/exams.js';
import paymentRoutes from './routes/payments.js';
import twoFactorRoutes from './routes/twoFactor.js';
import resultsRoutes from './routes/results.js';
import maintenanceRoutes from './routes/maintenance.js';
import { checkMaintenanceMode } from './middleware/maintenance.js';

console.log('Auth routes:', authRoutes);

// IMPORTANT: Auth and 2FA routes MUST NOT have maintenance mode checking
// because users don't have tokens yet during login process
app.use('/api/auth', authRoutes);
app.use('/api/2fa', twoFactorRoutes);

// Check maintenance mode for all OTHER API routes (after auth is complete)
app.use('/api/users', checkMaintenanceMode, userRoutes);
app.use('/api/admin', checkMaintenanceMode, adminRoutes);
app.use('/api/feedback', checkMaintenanceMode, feedbackRoutes);
app.use('/api/departments', checkMaintenanceMode, departmentRoutes);
app.use('/api/jobs', checkMaintenanceMode, jobRoutes);
app.use('/api/applications', checkMaintenanceMode, applicationRoutes);
app.use('/api/notifications', checkMaintenanceMode, notificationRoutes);
app.use('/api/exams', checkMaintenanceMode, examRoutes);
app.use('/api/payments', checkMaintenanceMode, paymentRoutes);
app.use('/api/results', checkMaintenanceMode, resultsRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Serve uploaded resumes statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('Routes loaded successfully');


// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handler middleware (should be last)
app.use(errorHandler);

// Handle unhandled routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Can't find ${req.originalUrl} on this server!`,
  });
});

const PORT = process.env.PORT || 5001;

// Automated maintenance mode completion checker
const checkAndCompleteExpiredMaintenance = async () => {
  try {
    const Maintenance = (await import('./models/Maintenance.js')).default;
    const now = new Date();

    // Find all active maintenance modes that have passed their end time
    const expiredMaintenance = await Maintenance.find({
      isMaintenanceMode: true,
      status: 'active',
      scheduledEndTime: { $lte: now },
    });

    if (expiredMaintenance.length > 0) {
      console.log(`\n🔧 Found ${expiredMaintenance.length} expired maintenance session(s). Auto-completing...`);
      
      for (const maintenance of expiredMaintenance) {
        await maintenance.deactivateMaintenanceMode();
        console.log(`   ✅ Auto-completed: "${maintenance.title}" (ended at ${maintenance.scheduledEndTime})`);
      }
    }
  } catch (error) {
    console.error('Error checking expired maintenance:', error);
  }
};

const startServer = async () => {
  // connectDB no longer throws — it logs and retries in the background
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   Auto-maintenance checker: Running every 60 seconds`);
  });

  // Run maintenance checker every 60 seconds
  setInterval(checkAndCompleteExpiredMaintenance, 60 * 1000);
  
  // Also run immediately on startup
  setTimeout(checkAndCompleteExpiredMaintenance, 5000);

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();

export default app;