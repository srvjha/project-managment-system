import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { env } from "../validators/env";
import { asyncHandler } from "../utils/asynHandler";
import { UserInterface } from "../models/user.models";

export const verifyUser =  asyncHandler(async(
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  
    let token = req.cookies?.accessToken;
    if (!token) {

      throw new ApiError("Unauthorized Request", 400);
    }
    // Verify access token
    console.log("before token")
    const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
    console.log("after token")
    req.user = decodedToken as UserInterface;
    next();
  
})
