// Temporarily disabled Upstash Redis for development
// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";

// import dotenv from "dotenv";

// dotenv.config();

// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(100, "10 s"), // 5 requests every 10 seconds
// });

// Temporary mock rate limiter that always allows requests
const ratelimit = {
  limit: async () => ({ success: true })
};

export default ratelimit;
