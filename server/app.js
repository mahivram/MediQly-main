import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectToDb from "./db/db.js";
import userRouter from "./routes/user.route.js";
import doctorRouter from "./routes/doctor.route.js";
import fitnessRouter from "./routes/fitness.route.js";
import aiRouter from "./routes/ai.js";

const app = express();

// Connect to MongoDB
connectToDb().catch(console.error);

// Configure CORS with more options
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:8000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Routes
app.use("/users", userRouter);
app.use("/doctors", doctorRouter);
app.use("/api", fitnessRouter);
app.use("/api/ai", aiRouter);

export default app;
