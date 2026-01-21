import express, { urlencoded } from "express";
import dotenv from "dotenv";
import 'dotenv/config';
import cors from "cors";
import connectDB from "./config/db.js";
import chatRoutes from "./routes/chatRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import emailVatifiation from "./routes/emailVerification.js"
import userRoute from './routes/user.js'

import chatRoute from './routes/chat.routes.js';
import knowledgeRoute from './routes/knowledge.routes.js';
// import pdfRoutes from './routes/pdfRoutes.js';
// import aibizRoutes from './routes/aibizRoutes.js';
// import fileUpload from 'express-fileupload';
import * as aibaseService from './services/aibaseService.js';
// import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from "./routes/notificationRoutes.js";
// import revenueRoutes from './routes/revenueRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import personalTaskRoutes from './routes/personalTaskRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import voiceRoutes from './routes/voiceRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
// import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
try {
  await connectDB();
  console.log("Database connection attempt finished, initializing services...");
  aibaseService.initializeFromDB();
} catch (error) {
  console.error("Database connection failed during startup:", error);
}


// Middleware

app.use(cors({
  origin: true, // Allow any origin in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser())
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// app.use(fileUpload()); // Removed to avoid conflict with Multer (New AIBASE)

app.get("/ping-top", (req, res) => {
  res.send("Top ping works");
})

app.get("/", (req, res) => {
  res.send("All working")
})
// Global Debug middleware (non-consumptive)
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[API DEBUG] ${req.method} ${req.url}`);
  }
  next();
});

// Mount Routes
// AIBASE Routes: /api/aibase/chat, /api/aibase/knowledge


// AIBASE Routes: /api/aibase/chat, /api/aibase/knowledge
app.use('/api/aibase/chat', chatRoute);
app.use('/api/aibase/knowledge', knowledgeRoute);

//Get user Route
app.use('/api/user', userRoute)

// Chat Routes: /api/chat (GET sessions), /api/chat/:id (GET history), /api/chat/:id/message (POST message)
app.use('/api/chat', chatRoutes);

// Auth Routes: /api/auth/login, /api/auth/signup
app.use('/api/auth', authRoutes);

// Agent Routes
app.use('/api/agents', agentRoutes);

// Dashboard Routes
app.use('/api', dashboardRoutes);

// Notification Routes
app.use('/api/notifications', notificationRoutes);

// Voice Routes
app.use('/api/voice', voiceRoutes);

// Reminder Routes
app.use('/api/reminders', reminderRoutes);

// Support Routes
app.use('/api/support', supportRoutes);

// Catch-all 404
app.use((req, res) => {
  console.warn(`[404 ERROR] No route found for: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route not found in local backend",
    method: req.method,
    path: req.originalUrl
  });
});


// Image Routes
import imageRoutes from './routes/image.routes.js';
app.use('/api/image', imageRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`AI-Mall Backend running on  http://localhost:${PORT}`);
  console.log("Razorpay Config Check:", {
    KeyID: process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 8)}...` : "MISSING",
    Secret: process.env.RAZORPAY_KEY_SECRET ? "PRESENT" : "MISSING"
  });
});

// Keep process alive for local development
setInterval(() => { }, 1000 * 60 * 60);