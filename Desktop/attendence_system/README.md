# Attendance System

A modern, full-stack attendance management system built with React, TypeScript, NestJS, and MongoDB.

## Features

- 🔐 **Authentication & Authorization**
  - User registration and login
  - Role-based access control (Admin, Teacher, Student)
  - JWT-based authentication

- 📊 **Attendance Management**
  - Real-time attendance marking
  - Attendance history tracking
  - Attendance statistics and analytics
  - Class-wise attendance reports

- 👥 **Class Management**
  - Create and manage classes
  - Add/remove students from classes
  - Class-wise attendance tracking

- 📱 **Modern UI/UX**
  - Responsive design
  - Dark/Light theme support
  - Real-time updates
  - Interactive dashboards

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Material-UI for components
- React Query for data fetching
- WebSocket for real-time updates

### Backend
- NestJS
- MongoDB
- JWT Authentication
- WebSocket Gateway
- Redis for caching

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Redis
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/omsherikar/Attendance_System.git
cd Attendance_System
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
# Backend
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url

# Frontend
VITE_API_URL=http://localhost:3000
```

4. Start the development servers:
```bash
# Start backend server
npm run start:dev

# Start frontend server (in a new terminal)
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Project Structure

```
attendance-system/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API and WebSocket services
│   │   ├── contexts/     # React contexts
│   │   └── theme/        # Theme configuration
│   └── ...
├── src/                  # NestJS backend application
│   ├── attendance/       # Attendance module
│   ├── auth/            # Authentication module
│   ├── class/           # Class management module
│   └── ...
└── ...
```

## API Documentation

The API documentation is available at `http://localhost:3000/api/docs` when running the backend server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Omsherikar - [GitHub](https://github.com/omsherikar)

Project Link: [https://github.com/omsherikar/Attendance_System](https://github.com/omsherikar/Attendance_System)

## Deployment

### Vercel Deployment Requirements

1. **Frontend Requirements**:
   - Vite configuration for production build
   - Environment variables set up in Vercel dashboard
   - Proper CORS configuration for API calls
   - Build command: `npm run build`
   - Output directory: `dist`

2. **Backend Requirements**:
   - NestJS application with proper production configuration
   - Environment variables for:
     - MongoDB connection string
     - JWT secret
     - Redis URL
     - API base URL
   - Build command: `npm run build`
   - Start command: `npm run start:prod`

3. **Database Requirements**:
   - MongoDB Atlas account (free tier available)
   - Redis instance (can use Redis Cloud free tier)

### Vercel Deployment Steps

1. **Frontend Deployment**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Login to Vercel
   vercel login

   # Deploy frontend
   cd frontend
   vercel
   ```

2. **Backend Deployment**:
   ```bash
   # Deploy backend
   cd ..
   vercel
   ```

3. **Environment Variables Setup**:
   In Vercel dashboard, add these environment variables:
   ```
   # Frontend
   VITE_API_URL=https://your-backend-url.vercel.app

   # Backend
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   REDIS_URL=your_redis_url
   NODE_ENV=production
   ```

4. **Domain Configuration**:
   - Add custom domain in Vercel dashboard
   - Configure DNS settings with your domain provider
   - Set up SSL certificates (automatic with Vercel)

### Vercel Configuration Files

1. **Frontend Vercel Configuration** (`frontend/vercel.json`):
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ]
   }
   ```

2. **Backend Vercel Configuration** (`vercel.json`):
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/src/main.js"
       }
     ]
   }
   ```

### Post-Deployment Steps

1. Update your frontend's API URL to point to the deployed backend
2. Test all features in the production environment
3. Set up monitoring and error tracking
4. Configure automatic deployments from your GitHub repository
