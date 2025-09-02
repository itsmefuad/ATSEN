import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.join(__dirname, 'backend', 'src', 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// Add production imports
content = content.replace(
  'import mongoose from "mongoose";',
  `import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";`
);

// Add production CORS configuration
const corsReplacement = `const app = express();
const PORT = process.env.PORT || 5001;

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure CORS for production
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://atsen.app',
  'https://www.atsen.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // For development, allow any localhost
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
  })
);

// parse JSON bodies
app.use(express.json());

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
}`;

content = content.replace(
  /const app = express\(\);\nconst PORT = process\.env\.PORT \|\| 5001;\n\n\/\/ enable CORS for all origins\napp\.use\(\n  cors\(\{\n    origin: "\*",\n    credentials: false,\n  \}\)\n\);\n\n\/\/ parse JSON bodies\napp\.use\(express\.json\(\)\);/,
  corsReplacement
);

// Add production route handling
const productionRoutes = `
// Serve React App in production
if (process.env.NODE_ENV === 'production') {
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ 
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(500).json({ 
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    path: req.originalUrl 
  });
});`;

// Replace the connection part with enhanced error handling
content = content.replace(
  /\/\/ connect to DB, then start the server\nconnectDB\(\)\.then\(\(\) => \{\n  app\.listen\(PORT, \(\) => \{\n    console\.log\("Server started on PORT:", PORT\);\n  \}\);\n\}\);/,
  `${productionRoutes}

// connect to DB, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
    console.log("Environment:", process.env.NODE_ENV);
  });
}).catch((error) => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});`
);

fs.writeFileSync(serverPath, content);
console.log('Applied all production configurations to server.js');
