# CRITICAL: File Storage Issue

## Problem
Files are stored locally in `backend/uploads/materials/` which means:
- ❌ Files get deleted on each deployment
- ❌ Files disappear when app restarts  
- ❌ Not accessible across multiple instances

## Current Files at Risk
- All teacher-uploaded materials
- Student submissions
- Any PDF attachments

## Solution Required
Switch to cloud storage immediately:

### Option 1: DigitalOcean Spaces (Recommended)
```bash
npm install @aws-sdk/client-s3 multer-s3
```

### Option 2: AWS S3
```bash
npm install @aws-sdk/client-s3 multer-s3
```

### Option 3: Cloudinary
```bash
npm install cloudinary multer-storage-cloudinary
```

## Files to Modify
- `backend/src/controllers/materialController.js`
- `backend/src/routes/materialRoutes.js`
- Add environment variables for storage credentials

## Urgency: HIGH
This should be fixed before production use to prevent data loss.