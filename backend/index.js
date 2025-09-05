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
// ===== Login Route =====
app.use('/auth/login',loginUser)
// ===== Admin Routes =====
app.use("/admin",AdminRouter);
// ===== User Routes =====
// ======Add New LLM Model Route=====
app.use('/llm', LLmRouter);

app.use('/user', UserRouter
);
// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

