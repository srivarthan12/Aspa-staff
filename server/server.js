// server/server.js
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import advanceRequestRoutes from './routes/advanceRequestRoutes.js';
// import uploadRoutes from './routes/uploadRoutes.js'; // THIS LINE IS REMOVED

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Consolidated CORS Configuration ---
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL // Your live frontend URL from Render
    : 'http://localhost:5173', // Your local frontend URL
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/advances', advanceRequestRoutes);
// app.use('/api/upload', uploadRoutes); // THIS LINE IS REMOVED


// --- Root Route for Testing ---
app.get('/', (req, res) => {
  res.send('API is running successfully...');
});


// --- Error Handling Middleware ---
// This should be the last thing before app.listen
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
