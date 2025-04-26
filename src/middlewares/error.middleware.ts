import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let customError: ApiError;
  if (err instanceof ApiError) {
    console.log("idhr hu")
    customError = err;
  } else {
    console.log("nhi bhai idhr hu")
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || "Internal Server Error";
    customError = new ApiError(statusCode, errorMessage);
  }
  res.status(customError.statusCode).json({
    success: customError.success,
    error: customError.message,
    data: customError.data,
    statusCode: customError.statusCode,
  });
};

export { errorHandler };
