import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Load env vars
dotenv.config();

// Connect to database
connectDB()
  .then(() => {
    console.log('✅ Database initialization complete');
  })
  .catch(err => {
    console.error('❌ Database connection failed, but server will continue for testing');
    console.error('⚠️  API endpoints requiring database will return errors');
    console.error('🔧 Fix database connection for full functionality');
    // Don't exit process - allow server to run for testing
  });

const app = express();

// Initialize Passport
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

console.log('Auth routes:', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/payments', paymentRoutes);

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

const startServer = async () => {
  // connectDB no longer throws — it logs and retries in the background
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
  });

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