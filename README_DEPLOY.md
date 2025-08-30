# 🚀 ATSEN - DigitalOcean Deployment

## Quick Deploy to DigitalOcean

1. **Push your code to GitHub**
2. **Create new app in DigitalOcean App Platform**
3. **Connect your GitHub repository**
4. **DigitalOcean auto-detects the `.do/app.yaml` configuration**
5. **Set environment variables in dashboard:**
   - `NODE_ENV=production`
   - `MONGODB_URI=your_mongodb_connection_string`
   - `JWT_SECRET=your_jwt_secret`
6. **Deploy!**

## Commands Available

- `npm run dev` - Development mode (both frontend & backend)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run digitalocean-build` - DigitalOcean build command

## Files You Have

- `package.json` - Root deployment configuration
- `.do/app.yaml` - DigitalOcean App Platform settings
- Modified `backend/src/server.js` - Serves React app in production

## That's It! 

Your app will be available at `https://your-app-name.ondigitalocean.app`
