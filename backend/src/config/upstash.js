import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "10 s"), // 5 requests every 10 seconds
});
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let ratelimit;
if (url && token) {
  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "10 s"), // 5 requests every 10 seconds
  });
} else {
  // Fallback no-op limiter for local/dev when Upstash is not configured
  ratelimit = {
    limit: async () => ({ success: true }),
  };
}

export default ratelimit;
