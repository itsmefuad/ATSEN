import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import roomsRoutes from "./routes/roomsRoutes.js";
import institutionRoute from "./routes/institutionRoutes.js";      // ← import it
import announcementRoutes from "./routes/announcementRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
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
app.use("/api/rooms", roomsRoutes);
app.use("/api/institutions", institutionRoute);               // ← mount it
app.use("/api/announcements", announcementRoutes);
app.use("/api/materials", materialRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});