import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import authRoute from './routes/auth.route.js'


const app = express();
// DEBUG — SEE EXACTLY WHAT'S HITTING YOUR SERVER
app.use((req, res, next) => {
  console.log("INCOMING REQUEST →", req.method, req.url);
  console.log("HEADERS →", req.headers["content-type"]);
  next();
});

// CORS — THIS IS THE MOST IMPORTANT FIX
app.use(cors({
  origin: true,                 // Allows any origin (your phone, emulator, web)
  credentials: true             // Allows cookies & Authorization headers
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser — needed for JWT cookie
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoute)

// Error handler
app.use((error, req, res, next) => {
  console.error("Error:", error);
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SERVER RUNNING ON http://10.14.212.253:${PORT}`);
 
});