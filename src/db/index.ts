import mongoose from "mongoose";
import { env } from "../validators/env";
import logger from "../utils/logger";
const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info("✅ MongoDB Connected");
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error("❌ MongoDB Connection Error:", err);
    } else {
      logger.error("Unknown Error Occurred: ", err);
    }

    process.exit(1);
  }
};

export default connectDB;
