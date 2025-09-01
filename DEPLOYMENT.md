# ATSEN - Educational Platform

## Deployment Instructions

This application is configured for deployment on cloud platforms like Render.com or DigitalOcean App Platform.

### Environment Variables Required

Make sure to set these environment variables in your deployment platform:

#### Backend Environment Variables
- `NODE_ENV=production`
- `MONGO_URI=your_mongodb_connection_string`
- `JWT_SECRET=your_jwt_secret_key`
- `PORT=10000` (or as required by your platform)
- `UPSTASH_REDIS_REST_URL=your_upstash_redis_url`
- `UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token`

#### Optional Environment Variables
- `ZOOM_ACCOUNT_ID=your_zoom_account_id`
- `ZOOM_CLIENT_ID=your_zoom_client_id`
- `ZOOM_CLIENT_SECRET=your_zoom_client_secret`

### Deployment Commands

#### Build Command
```bash
npm run build
```

#### Start Command
```bash
npm run start
```

### Platform-Specific Instructions

#### Render.com
1. Connect your GitHub repository
2. Use the provided `render.yaml` configuration
3. Set environment variables in the Render dashboard
4. Deploy!

#### DigitalOcean App Platform
1. Create a new app from your GitHub repository
2. Use the following build settings:
   - Build Command: `npm run build`
   - Run Command: `npm run start`
3. Set environment variables in the app settings
4. Configure your custom domains (atsen.app, www.atsen.app)

### Domains
- Primary: atsen.app
- WWW: www.atsen.app

### Local Development

To run locally:

```bash
# Install all dependencies
npm run install:all

# Run in development mode (both frontend and backend)
npm run dev
```

### Project Structure
```
├── backend/           # Express.js API server
│   ├── src/
│   ├── uploads/       # File uploads
│   └── public/        # Built frontend files (production)
├── frontend/          # React.js application
│   └── src/
└── render.yaml        # Render.com configuration
```

### Build Process
1. Frontend builds to `backend/public/`
2. Backend serves static files in production
3. API routes are prefixed with `/api`
4. React Router handles client-side routing

### Health Check
The application includes a health check endpoint at `/health` for monitoring.
