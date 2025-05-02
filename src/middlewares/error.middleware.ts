import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import logger from "../utils/logger";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let customError: ApiError;
  if (err instanceof ApiError) {
    customError = err;
  } else {
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || "Internal Server Error";
    customError = new ApiError(errorMessage,statusCode);
  }
  logger.error(customError.message)
  res.status(customError.statusCode).json({
    success: customError.success,
    error: customError.message,
    data: customError.data,
    statusCode: customError.statusCode,
  });
};

export { errorHandler };
