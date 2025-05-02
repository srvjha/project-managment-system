import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.static("public"));

import healthCheckRouter from "./routes/healthcheck.routes";
import userRouter from "./routes/auth.routes";
import projectRouter from "./routes/project.routes";
import noteRouter from "./routes/note.routes";
import taskRouter from "./routes/task.routes";
import { errorHandler } from "./middlewares/error.middleware";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/project", noteRouter);
app.use("/api/v1/project", taskRouter);

app.use(errorHandler);

export { app };
