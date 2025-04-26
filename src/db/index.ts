import mongoose from "mongoose";
import { env } from "../validators/env";
const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ MongoDB Connection Error:", err);
    } else {
      console.error("Unknown Error Occurred: ", err);
    }

    process.exit(1);
  }
};

export default connectDB;
