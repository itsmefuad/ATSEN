import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import adminRoutes from "./routes/adminRoutes.js";

import institutionRoutes from "./routes/institutionRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

import roomsRoutes from "./routes/roomsRoutes.js";
import institutionRoute from "./routes/institutionRoutes.js";      // ← import it
import announcementRoutes from "./routes/announcementRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimiter from "./middlewares/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
// app.use(rateLimiter); // Temporarily disabled for testing

// mount your routes
app.use("/api/admin", adminRoutes);
app.use("/api/institutions", institutionRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/students", studentRoutes);

app.use("/api/institutions", institutionRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/students", studentRoutes);

app.use("/api/rooms", roomsRoutes);
app.use("/api/institutions", institutionRoute);               // ← mount it
app.use("/api/announcements", announcementRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});