import { app } from "./app";
import dotenv from "dotenv";
import connectDB from "./db";

dotenv.config({
  path: "./.env",
});
const PORT = process.env.PORT ?? 8000;
connectDB();

app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
