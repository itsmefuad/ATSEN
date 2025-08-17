import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import roomsRoutes from "./routes/roomsRoutes.js";
import institutionRoute from "./routes/institutionRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import { connectDB } from "./config/db.js";
// import rateLimiter from "./middlewares/rateLimiter.js";

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
//app.use(rateLimiter);

// mount your routes
app.use("/api/rooms", roomsRoutes);
app.use("/api/yuvraj/announcements", yuvrajAnnouncementRoutes);
app.use("/api/institutions", institutionRoute);
app.use("/api/announcements", announcementRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});