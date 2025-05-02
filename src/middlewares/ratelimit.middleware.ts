import { rateLimit } from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    statusCode: 429,
    message: "Too many login attempts. Please try again in 5 minutes.",
  },
});

export const emailsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: {
    statusCode: 429,
    message: "Too many requests from this IP. Please try again after an hour.",
  },
});
