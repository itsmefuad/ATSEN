// backend/src/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import roomsRoutes           from "./routes/roomsRoutes.js";
import institutionRoutes     from "./routes/institutionRoutes.js";
import institutionRoomRoutes from "./routes/institution/InstitutionRoomRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import { connectDB }         from "./config/db.js";
import rateLimter           from "./middlewares/rateLimiter.js";
import yuvrajAnnouncementRoutes from "./routes/yuvraj_announcementRoutes.js";

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

// institution CRUD
app.use("/api/institutions", institutionRoutes);

// room‐creation under institutions
app.use("/api/institutions", institutionRoomRoutes);
app.use("/api/yuvraj/announcements", yuvrajAnnouncementRoutes);
//app.use("/api/institutions", institutionRoute);
app.use("/api/announcements", announcementRoutes);
app.use("/api/materials", materialRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT:", PORT);
  });
});