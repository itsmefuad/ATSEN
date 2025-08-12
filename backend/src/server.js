import express from "express";
import roomsRoutes from "./routes/roomsRoutes.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import rateLimter from "./middlewares/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// middlewares
app.use(express.json()); // for parsing JSON bodies: req.body
app.use(rateLimter);

// app.use((req, res, next) => {
//   console.log(`Req Method: ${req.method}\nReq URL: ${req.url}`);
//   next();
// });

// prefixing
app.use("/api/rooms", roomsRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server started on PORT: ", PORT);
  });
});
