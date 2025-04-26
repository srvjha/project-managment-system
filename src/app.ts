import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.static("public"))



import userRouter from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";
app.use("/api/v1/auth", userRouter);

app.use(errorHandler);

export {app}