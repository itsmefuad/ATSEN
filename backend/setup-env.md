# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the `backend` folder with the following variables:

### MongoDB Atlas Connection
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**How to get this:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create/select your cluster
3. Click "Connect"
4. Choose "Connect your application"
5. Copy the connection string
6. Replace `username`, `password`, `cluster`, and `database` with your actual values

### Admin Secret Key
```
ADMIN_SECRET=your_strong_admin_secret_key_here
```

**Generate a strong secret:**
- Use a random string generator
- At least 32 characters
- Mix of letters, numbers, and symbols
- Example: `K8#mP9$vL2@nQ7&xR4!wE5%tY8^uI3*oP6`

### Optional Variables
```
PORT=5001
```

## Example .env file:
```
MONGO_URI=mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/atsen?retryWrites=true&w=majority
ADMIN_SECRET=K8#mP9$vL2@nQ7&xR4!wE5%tY8^uI3*oP6
PORT=5001
```

## Frontend Environment Variables

Create a `.env` file in the `frontend` folder:

```
VITE_API_URL=http://localhost:5001
VITE_ADMIN_KEY=K8#mP9$vL2@nQ7&xR4!wE5%tY8^uI3*oP6
```

**Note:** The `VITE_ADMIN_KEY` should match your backend `ADMIN_SECRET`.

## Testing the Connection

1. Start your backend server: `npm run dev`
2. Check the console for MongoDB connection status
3. Visit `http://localhost:5001/api/db-status` to verify database connection
4. Test creating an announcement or form

## Troubleshooting

### Database Connection Issues
- Verify your MongoDB Atlas cluster is running
- Check if your IP address is whitelisted in Atlas
- Ensure username/password are correct
- Verify the database name exists

### Admin Authentication Issues
- Ensure `ADMIN_SECRET` is set in backend `.env`
- Ensure `VITE_ADMIN_KEY` matches in frontend `.env`
- Check that the `x-admin-key` header is being sent in requests

### Common Errors
- `MONGO_URI is not set`: Add the variable to your backend `.env`
- `Failed to connect to MongoDB Atlas`: Check your connection string and network access
- `Admin authentication required`: Verify your admin keys match
