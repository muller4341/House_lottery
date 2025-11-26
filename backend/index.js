import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

// Routes
import userRouter from './routes/userRouter.js';
import auth from './routes/auth.js';
import propertyRouter from './routes/property.js';
// ... your other routes

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

// Database connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.log('DB Error:', err));

// Routes
app.use('/api/user', userRouter);
app.use('/api/auth', auth);
app.use('/api/property', propertyRouter);
// ... your other routes

// Error handler
app.use((error, req, res, next) => {
  console.error("Error:", error);
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  res.status(statusCode).json({ success: false, message });
});

// Serve static files (only if you have web build)
// app.use(express.static(path.join(__dirname, '/client/dist')));
// app.get('*', (req, res) => {
//   if (!req.path.startsWith('/api')) {
//     res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
//   }
// });

// Start server on ALL interfaces (so phone can reach it)
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`SERVER RUNNING ON http://10.14.212.253:${PORT}`);
  console.log(`For phone: http://10.14.212.253:${PORT}`);
  console.log(`For emulator: http://10.0.2.2:${PORT}`);
});