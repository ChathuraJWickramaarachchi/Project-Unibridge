# Admin Dashboard Documentation

## Overview
The Admin Dashboard provides comprehensive user and employer management capabilities for the UniBridge platform. Admins can monitor platform activity, manage user accounts, and maintain system integrity.

## Features

### Dashboard Overview
- **Statistics Cards**: Real-time metrics showing total users, students, employers, and verified accounts
- **User Distribution Chart**: Visual breakdown of user types
- **Recent Users**: Quick view of latest registrations
- **Quick Navigation**: Easy access to user management

### User Management
- **User List**: Filterable table of all users with search functionality
- **Role-based Filtering**: Filter by student, employer, or admin roles
- **Verification Status**: Filter by verified/unverified accounts
- **User Actions**: 
  - View detailed user information
  - Edit user details
  - Verify/unverify accounts
  - Delete users (with confirmation)

### User Details
- **Comprehensive Profile View**: Full user information display
- **Editable Fields**: Update user information directly
- **Account Status**: Verification status and account creation dates
- **Profile Information**: University, major, year, and bio details

## Access Requirements

### Admin Account Creation
To access the admin dashboard, you need an admin account. You can create one by:

1. **Using the API directly**:
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@unibridge.com",
    "password": "admin123",
    "role": "admin"
  }'
```

2. **Through the registration form**: 
   - Register as a regular user
   - Contact system administrator to upgrade your account to admin role

### Navigation to Admin Panel
Once logged in as an admin:
- **Desktop**: Click "Admin Panel" button in the top navigation bar
- **Mobile**: Tap the menu button and select "Admin Panel"

## Admin Routes

### Main Dashboard
- **URL**: `/admin`
- **Description**: Overview statistics and recent activity

### User Management
- **URL**: `/admin/users`
- **Description**: List and manage all users
- **Features**: 
  - Search by name or email
  - Filter by role (student/employer/admin)
  - Filter by verification status
  - Pagination support

### User Details
- **URL**: `/admin/users/:id`
- **Description**: View and edit individual user profiles
- **Features**:
  - Complete user information display
  - Edit mode for updating details
  - Verification toggle
  - Account status information

## Security Features

### Role-based Access Control
- Only users with `admin` role can access the dashboard
- Unauthorized access attempts are redirected to the main site
- All admin actions require authentication

### Protected Endpoints
All admin API endpoints are protected with:
- JWT token authentication
- Role authorization middleware
- Secure CORS configuration

## API Endpoints

### Dashboard Statistics
```
GET /api/admin/stats
```
Returns: Total users, students, employers, admins, verified users, and recent users

### User Management
```
GET /api/admin/users
```
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for name/email
- `role`: Filter by role (student/employer/admin)
- `isVerified`: Filter by verification status (true/false)

```
GET /api/admin/users/:id
```
Returns: Detailed information for specific user

```
PUT /api/admin/users/:id
```
Body: User update data
Returns: Updated user information

```
DELETE /api/admin/users/:id
```
Returns: Success message

```
PUT /api/admin/users/:id/verify
```
Body: `{ "isVerified": true/false }`
Returns: Updated user with verification status

## Development Setup

### Backend Requirements
1. Node.js server running on port 5001
2. MongoDB Atlas connection configured
3. Admin user account created

### Frontend Requirements
1. React application running (port 8081 in this setup)
2. Proper CORS configuration for development
3. Admin authentication token stored in localStorage

### Environment Variables
Ensure your `.env` file includes:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:8081
PORT=5001
```

## Best Practices

### User Management
- Always verify user identities before making account changes
- Use search and filters to quickly locate specific users
- Review recent user registrations regularly
- Maintain proper documentation for account modifications

### Security
- Never share admin credentials
- Regularly review access logs
- Keep JWT secrets secure
- Monitor for suspicious activity

### Data Integrity
- Verify all user information before making changes
- Use the verification system appropriately
- Maintain consistent data formats
- Regular backup of user data

## Troubleshooting

### Common Issues

1. **Access Denied**: Ensure you're logged in with an admin account
2. **CORS Errors**: Check that the frontend URL is in the CORS configuration
3. **404 Errors**: Verify the backend server is running on port 5001
4. **Empty Data**: Confirm MongoDB connection and data exists

### Debugging Steps
1. Check browser console for JavaScript errors
2. Verify network requests in developer tools
3. Confirm authentication token is valid
4. Check backend server logs for errors
5. Validate MongoDB connection status

## Future Enhancements

### Planned Features
- [ ] Employer-specific management tools
- [ ] Analytics and reporting dashboard
- [ ] Bulk user operations
- [ ] Audit logging for admin actions
- [ ] Email notification system
- [ ] User activity monitoring
- [ ] Advanced filtering and sorting options
- [ ] Export functionality for user data

This documentation provides a comprehensive guide for using and maintaining the UniBridge Admin Dashboard. For technical support, please contact the development team.