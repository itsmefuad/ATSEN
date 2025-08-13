import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import roomsRoutes from "./routes/roomsRoutes.js";
import { connectDB } from "./config/db.js";
import rateLimter from "./middlewares/rateLimiter.js";
import cors from "cors";
import yuvrajAnnouncementRoutes from "./routes/yuvraj_announcementRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // allow frontend to access backend
    // credentials: true, // allow cookies to be sent
  })
);
app.use(express.json()); // for parsing JSON bodies: req.body
app.use(cors({ origin: "*" }));
app.use(rateLimter);

// app.use((req, res, next) => {
//   console.log(`Req Method: ${req.method}\nReq URL: ${req.url}`);
//   next();
// });

// prefixing
app.use("/api/rooms", roomsRoutes);
app.use("/api/yuvraj/announcements", yuvrajAnnouncementRoutes);
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT: ", PORT);
  });
});
