# Development Guide

This guide provides detailed information for developers working on the Attendance Management System.

## Development Environment Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git
- VS Code (recommended) or any other code editor

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/omsherikar/Attendance.git
   cd Attendance
   ```

2. **Install Dependencies**
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/attendance
   JWT_SECRET=your-secret-key
   PORT=3000
   ```

## Development Workflow

### Backend Development

1. **Starting the Development Server**
   ```bash
   npm run start:dev
   ```
   This will start the server with hot-reload enabled.

2. **Running Tests**
   ```bash
   npm run test
   ```

3. **Code Structure**
   - Controllers: Handle HTTP requests
   - Services: Business logic
   - DTOs: Data Transfer Objects
   - Entities: Database models
   - Guards: Authentication and authorization

### Frontend Development

1. **Starting the Development Server**
   ```bash
   cd frontend
   npm start
   ```

2. **Code Structure**
   - Components: Reusable UI components
   - Pages: Main application pages
   - Contexts: State management
   - Services: API calls
   - Types: TypeScript interfaces

## Database Management

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create a new database named `attendance`
3. Update the `MONGODB_URI` in your `.env` file

### Database Migrations
Currently, the system uses automatic schema generation. For any schema changes:
1. Update the entity files
2. Restart the server

## API Development

### Adding New Endpoints
1. Create a new controller in the appropriate module
2. Define the route and method
3. Create necessary DTOs
4. Implement the service method
5. Add documentation to README.md

### Testing Endpoints
Use Postman or any API testing tool:
- Base URL: `http://localhost:3000`
- Authentication: Include JWT token in Authorization header

## Frontend Development

### Adding New Features
1. Create new components in `frontend/src/components`
2. Add new pages in `frontend/src/pages`
3. Update routing in `App.tsx`
4. Add necessary API calls in services

### Styling
- Use Material-UI components
- Follow the existing styling patterns
- Use the theme provider for consistent styling

## Deployment

### Backend Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start:prod
   ```

### Frontend Deployment
1. Build the application:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `build` folder to your hosting service

## Troubleshooting

### Common Issues

1. **MongoDB Connection Issues**
   - Verify MongoDB is running
   - Check connection string in `.env`
   - Ensure proper network access

2. **Authentication Issues**
   - Verify JWT secret matches
   - Check token expiration
   - Ensure proper role assignments

3. **Frontend Build Issues**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies are installed

## Contributing

1. Create a new branch for your feature
2. Follow the coding standards
3. Write tests for new features
4. Update documentation
5. Create a pull request

## Code Standards

### Backend
- Use NestJS decorators properly
- Follow SOLID principles
- Write meaningful comments
- Use TypeScript types

### Frontend
- Use functional components
- Follow React hooks rules
- Use TypeScript for type safety
- Maintain consistent styling

## Security Considerations

1. **Authentication**
   - Use JWT for authentication
   - Implement proper password hashing
   - Use role-based access control

2. **Data Protection**
   - Validate all inputs
   - Sanitize user data
   - Use proper error handling

3. **API Security**
   - Implement rate limiting
   - Use HTTPS
   - Validate all requests

## Performance Optimization

1. **Backend**
   - Use proper indexing in MongoDB
   - Implement caching where necessary
   - Optimize database queries

2. **Frontend**
   - Implement lazy loading
   - Optimize bundle size
   - Use proper state management 