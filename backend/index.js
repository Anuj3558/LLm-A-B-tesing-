// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './connection.js';
import AdminRouter from './router/Admin/AdminRouter.js';
import UserRouter from './router/User/UserRouter.js';
import llmTestingRoutes from './routes/llmTesting.js';
import promptHistoryRoutes from './routes/promptHistory.js';
import { loginUser } from './services/Auth.js';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ===== Middleware =====
// CORS configuration for different environments
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN || 'https://genzeon-ab.onrender.com'
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(morgan('dev'));

// Body parsers
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded form data

// ===== Test Route =====
app.get('/', (req, res) => {
  res.send({ message: 'Server is running 🚀' });
});

// ===== Login Route =====
app.use('/api/auth/login',loginUser)
// ===== Admin Routes =====
app.use("/api/admin",AdminRouter);
// ===== User Routes =====
app.use("/api/user",UserRouter);
// ===== LLM Testing Routes =====
app.use("/api/llm",llmTestingRoutes);
// ===== Prompt History Routes =====
app.use("/api/prompt-history",promptHistoryRoutes);

// ===== Serve React App =====
// Determine the correct path to the built React app
const distPath = process.env.NODE_ENV === 'production' 
  ? path.join(process.cwd(), 'dist')  // For Render: use process.cwd()
  : path.join(__dirname, '../dist');  // For local development

console.log('📂 Serving static files from:', distPath);

// Serve static files from React build
app.use(express.static(distPath));

// Handle React Router - serve React app for all non-API routes
app.use((req, res, next) => {
  // Skip if it's an API route
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Skip if it's a static file (has file extension)
  if (req.path.includes('.') && !req.path.endsWith('/')) {
    return next();
  }
  
  // Serve React app for all other routes
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath);
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});