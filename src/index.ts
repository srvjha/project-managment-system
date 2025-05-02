import { app } from "./app";
import dotenv from "dotenv";
import connectDB from "./db";
import logger from "./utils/logger";

dotenv.config({
  path: "./.env",
});
const PORT = process.env.PORT ?? 8000;
connectDB();

app.listen(PORT, () => {
  logger.info(`Server is running on port: ${PORT}`);
});
