import dotenv from "dotenv";
dotenv.config(); // ✅ সবার আগে লোড হওয়া দরকার

import express, { Application, Request, Response } from 'express';
import { userRoutes } from './app/controllers/user.controller';
import cors from "cors";
import { duaRoutes } from './app/controllers/dua.controller';
import mongoose from 'mongoose';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',               // local dev
  'https://hidayah-client.vercel.app',  // production
];

const app: Application = express();

// ✅ MongoDB Connection for Vercel/Production
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ivo4yuq.mongodb.net/hidayahDB?retryWrites=true&w=majority&appName=Cluster0`);
    console.log("✅ Connected to MongoDB (hidayahDB)");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
};

connectDB();

app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. mobile apps, curl)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
}));

// ✅ /api prefix — client-এর base URL-এর সাথে মিলানো
app.use("/api/users", userRoutes);
app.use("/api/dua",   duaRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Hidayah API is running ✅');
});

export default app;