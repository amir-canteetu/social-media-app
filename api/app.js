import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenvSafe from 'dotenv-safe';
import fs from 'fs';
import path from 'path';
import { connectDB } from './config/db.js';
import { assignId } from './middleware/assignId.js';
import userRoutes from './routes/users.js';

// Load and validate environment variables
dotenvSafe.config();

// Initialize the express app
const app = express();

// Connect to the database
connectDB();

// Create a write stream (in append mode) for logging
const accessLogStream = fs.createWriteStream(path.join(path.resolve(), 'access.log'), { flags: 'a' });

// Define a custom Morgan format including a unique request ID
morgan.token('id', (req) => req.id);
const customMorganFormat = ':id :method :url :status :response-time ms - :res[content-length]';

// Assign unique ID to each request
app.use(assignId);

// Use Morgan middleware for logging HTTP requests
app.use(morgan(customMorganFormat, { stream: accessLogStream }));

// Use helmet middleware with specific configurations
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'trusted.com'],
        styleSrc: ["'self'", 'trusted.com'],
        imgSrc: ["'self'", 'img.trusted.com'],
        connectSrc: ["'self'", 'api.trusted.com'],
        fontSrc: ["'self'", 'fonts.googleapis.com', 'fonts.gstatic.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    frameguard: { action: 'sameorigin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hidePoweredBy: true,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    ieNoOpen: true,
    noSniff: true,
    xssFilter: true,
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// Define routes
app.use('/', userRoutes);

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server with port from environment variables or default to 8800
const PORT = process.env.PORT || 8800;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
