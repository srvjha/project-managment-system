import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asynHandler";
import { User } from "../models/user.models";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { env } from "../validators/env";
import {
  validateLoginData,
  validateRegisterData,
} from "../validators/user.validation";
import { handleZodError } from "../utils/handleZodError";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { emailVerificationMailgenContent, sendEmail } from "../utils/sendMail";
import mongoose from "mongoose";
import { AuthRequest } from "../types/express";

const generateAccessAndRefreshToken = async (
  userId: mongoose.Types.ObjectId,
) => {
  try {
    const user = await User.findById(userId);
  
    if (!user) {
      throw new ApiError("User not found", 400);
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log("Generate Access and Refresh Token Error: ", error);
    throw new ApiError("Internal Server Down", 500);
  }
};

const register = asyncHandler(async (req, res) => {
  const { fullName, username, email, password } = handleZodError(
    validateRegisterData(req.body),
  );

  console.log(req.body);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError("Email already registered", 500);
  }

  let user = await User.create({
    email,
    password,
    username,
    fullName,
  });

  if (!user) {
    throw new ApiError("User registration failed", 500);
  }

  const { hashedToken, tokenExpiry, unHashedToken } = user.generateToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  const avatarLocalPath = req.file?.path;
  let avatarURL;
  if (avatarLocalPath) {
    avatarURL = await uploadOnCloudinary(avatarLocalPath);
  }

  if (avatarURL && avatarLocalPath) {
    user.avatar = {
      url: avatarURL?.url,
      localPath: avatarLocalPath,
    };
  }
  await user.save();

  const verificationUrl = `${env.BASE_URI}/api/v1/auth/verify/${unHashedToken}`;

  await sendEmail(
    user.email,
    "Verify Email",
    emailVerificationMailgenContent(user.username, verificationUrl),
  );

  //  await sendVerificationMai(user.username, user.email, unHashedToken);

  res
    .status(201)
    .json(
      new ApiResponse(
        200,
        user,
        "User registered successfully. Please verify your email",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = handleZodError(validateLoginData(req.body));

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError("User not found", 400);
  }

  if (!user.isEmailVerified) {
    throw new ApiError("User is not verified", 400);
  }

  const verifyPassword = await user.isPasswordCorrect(password);

  if (!verifyPassword) {
    throw new ApiError("Invalid Credentials", 400);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id as mongoose.Types.ObjectId,
  );
  const cookieOption = {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  };
  res
    .cookie("accessToken", accessToken, cookieOption)
    .cookie("refreshToken", refreshToken, cookieOption)
    .status(200)
    .json(new ApiResponse(200, {}, "User logged in Successfully"));

});

const logoutUser = asyncHandler(async (req:AuthRequest, res) => {
    const id = req?.user._id;
    if(!id){
      throw new ApiError("Invalid Request",400)
    }

    const userInfo = await User.findById(id);
    if(!userInfo){
      throw new ApiError("User not found",400)
    }
    userInfo.refreshToken = undefined
    await userInfo.save()
    res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "User Logged Out Successfully"
      )
    )
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) {
    throw new ApiError("Verification token is required!", 500);
  }
  // here i have unhashed token so have to make it hash first
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: new Date() },
  });
  if (!user) {
    throw new ApiError("Invalid User or token expired", 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  await user.save();

  res.status(200).json(new ApiResponse(200, {}, "Email verified successfully"));
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});
const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  //validation
});

export {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  register,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmail,
};
