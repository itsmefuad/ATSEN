import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import dotenv from "dotenv";

dotenv.config();

// Only initialize Upstash when required env vars are present; otherwise export a no-op limiter
const hasUpstashEnv =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const ratelimit = hasUpstashEnv
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "10 s"), // 5 requests every 10 seconds
    })
  : {
      // Minimal compatible interface for development/local without Upstash
      limit: async () => ({ success: true }),
    };

export default ratelimit;
