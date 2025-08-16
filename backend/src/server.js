import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import roomsRoutes from "./routes/roomsRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimter from "./middlewares/rateLimiter.js";
import yuvrajAnnouncementRoutes from "./routes/yuvraj_announcementRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(
  cors({
    origin: "*", // allow all origins to access backend
    credentials: false, // disable credentials when using "*"
  })
);
app.use(express.json()); // for parsing JSON bodies: req.body
app.use(rateLimter);

// app.use((req, res, next) => {
//   console.log(`Req Method: ${req.method}\nReq URL: ${req.url}`);
//   next();
// });

// Test route to check database connection
app.get("/api/db-status", (req, res) => {
  const connection = mongoose.connection;
  res.json({
    readyState: connection.readyState,
    host: connection.host,
    name: connection.name,
    port: connection.port,
    user: connection.user,
    isAtlas: connection.host?.includes('mongodb.net'),
    message: connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// prefixing
app.use("/api/rooms", roomsRoutes);
app.use("/api/yuvraj/announcements", yuvrajAnnouncementRoutes);
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT: ", PORT);
  });
});
