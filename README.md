# Hub - Productivity Dashboard

A modern productivity dashboard that integrates with multiple services (Google, Microsoft, GitHub, Apple) to provide a unified workspace experience.

## Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and Radix UI components
- **Backend**: FastAPI with Firebase/Firestore for data storage
- **Authentication**: Auth0 for OAuth integration
- **Services**: Google Calendar/Gmail, Microsoft Outlook/Teams, GitHub, Apple services

## Current Status

The application has been updated with the following fixes:

### ✅ Fixed Issues
1. **Firebase Admin SDK Integration** - Properly initialized with credential file
2. **Backend Dependencies** - Added all required Python packages
3. **Authentication Flow** - Fixed Auth0 OAuth flow with proper redirects
4. **Error Handling** - Added comprehensive error handling for all API calls
5. **Cookie Management** - Fixed secure cookie handling between frontend and backend
6. **Database Operations** - Added proper null checks and error handling for Firestore

### 🔧 Integration Points
- Frontend calls backend via `/api/auth/[provider]` for authentication
- Backend handles OAuth with Auth0 and redirects to frontend dashboard
- Dashboard fetches data from `/dashboard` endpoint with service integrations
- Session data is stored in Firebase Firestore

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp ../.env.sample ../.env
# Edit .env with your actual Auth0 credentials

# Start the backend server
python start.py
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontex

# Install Node.js dependencies
npm install

# Set up environment variables
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local

# Start the frontend server
npm run dev
```

### 3. Configuration

1. **Auth0 Setup**: Create an Auth0 application and configure:
   - Allowed Callback URLs: `http://localhost:8000/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`

2. **Firebase Setup**: The Firebase credentials are already included in the project

3. **Service API Keys**: Configure API keys for Google, Microsoft, GitHub, and Apple services

## Usage

1. Start both backend (port 8000) and frontend (port 3000)
2. Navigate to `http://localhost:3000`
3. Click "Continue with [Provider]" to authenticate
4. Access the dashboard with integrated services

## API Endpoints

- `GET /auth/login` - Initiate OAuth flow
- `GET /auth/callback` - Handle OAuth callback
- `GET /dashboard` - Get aggregated user data
- `GET /session/data` - Get user session data
- `POST /session/data` - Save user session data
- Service-specific endpoints for Google, Microsoft, GitHub, and Apple

## Recent Changes

### Backend (`backend/routes.py`)
- Fixed Firebase Admin SDK initialization with proper credential file path
- Added comprehensive error handling for all service API calls
- Improved authentication flow with proper redirects
- Added environment variable validation
- Fixed database operations with null checks

### Frontend
- No changes needed - the existing code is compatible with the backend fixes

### Dependencies
- Added `requirements.txt` with all necessary Python packages
- Added startup script with environment validation
- Created sample environment configuration

## Development

The application is now properly configured for development with:
- Automatic reloading for both frontend and backend
- Proper error handling and logging
- Environment variable management
- Production-ready authentication flow

## Next Steps

1. Configure actual Auth0 credentials
2. Set up service API keys (Google, Microsoft, GitHub, Apple)
3. Test the complete authentication flow
4. Add more service integrations as needed
