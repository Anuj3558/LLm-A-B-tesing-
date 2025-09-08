// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import connectDB from './connection.js';
import AdminRouter from './router/Admin/AdminRouter.js';
import { loginUser } from './services/Auth.js';
import LLmRouter from './services/LLmModelRoutes.js';
import UserRouter from './router/User/UserRouter.js';

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(morgan('dev'));

// Body parsers
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded form data

// ===== Test Route =====
app.get('/', (req, res) => {
  res.send({ message: 'Server is running 🚀' });
});

// ===== Debug Route =====
app.get('/api/debug/token', (req, res) => {
  const authHeader = req.headers.authorization;
  console.log('Auth Header:', authHeader);
  res.json({ 
    authHeader,
    hasBearer: authHeader?.startsWith('Bearer '),
    token: authHeader?.substring(7) 
  });
});

// ===== Login Route =====
app.use('/api/auth/login',loginUser)
// ===== Admin Routes =====
app.use("/api/admin",AdminRouter);
// ===== User Routes =====
// ======Add New LLM Model Route=====
app.use('/api/llm', LLmRouter);

app.use('/api/user', UserRouter
);
// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

