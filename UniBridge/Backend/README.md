# UniBridge Backend API

## Setup Instructions

### 1. MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (free tier available)
4. Create a database user:
   - Go to Database Access
   - Add new database user
   - Choose Password authentication
   - Set username and password
   - Assign "Read and write to any database" permissions
5. Configure network access:
   - Go to Network Access
   - Add IP address
   - Add `0.0.0.0/0` to allow connections from anywhere (for development)
6. Get your connection string:
   - Go to Clusters
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

### 2. Environment Configuration
1. Update the `.env` file with your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/unibridge?retryWrites=true&w=majority
```

2. Update the JWT secret for production:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/change-password` - Change user password

### User Profile
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Health Check
- `GET /api/health` - Check server status

## Example Requests

### Register User
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get User Profile (requires authentication)
```bash
curl -X GET http://localhost:5001/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Frontend Integration
The backend is configured to work with your React frontend running on `http://localhost:5173`. Make sure to:
1. Update the frontend `authService.js` to use the correct API URL
2. Set up proper CORS configuration in the `.env` file
3. Use the same JWT token handling between frontend and backend

## Security Notes
- Always use environment variables for sensitive data
- Change the JWT secret in production
- Use HTTPS in production
- Implement proper rate limiting
- Add input validation and sanitization
- Consider adding helmet.js for security headers