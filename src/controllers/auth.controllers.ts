import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asynHandler";
import { User } from "../models/user.models";
import crypto from "crypto";
import { env } from "../validators/env";
import {
  validateLoginData,
  validateRegisterData,
} from "../validators/user.validation";
import { handleZodError } from "../utils/handleZodError";
import { uploadOnCloudinary } from "../utils/cloudinary";
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../utils/sendMail";
import mongoose from "mongoose";

import jwt from "jsonwebtoken";

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
      url: avatarURL?.secure_url,
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

const logoutUser = asyncHandler(async (req, res) => {
  const id = req?.user._id;
  if (!id) {
    throw new ApiError("Invalid Request", 400);
  }

  const userInfo = await User.findById(id);
  if (!userInfo) {
    throw new ApiError("User not found", 400);
  }
  userInfo.refreshToken = undefined;
  await userInfo.save();
  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .status(200)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
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
  const { email } = req.body;

  if (!email) {
    throw new ApiError("Email is required", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("User not found", 400);
  }

  if (user.isEmailVerified) {
    throw new ApiError("User already exists", 400);
  }

  const { hashedToken, tokenExpiry, unHashedToken } = user.generateToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  await user.save()

  const verificationUrl = `${env.BASE_URI}/api/v1/auth/verify/${unHashedToken}`;

  await sendEmail(
    user.email,
    "Verify Email",
    emailVerificationMailgenContent(user.username, verificationUrl),
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Verification link sent successfully. Check Inbox",
      ),
    );
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError("Email is required", 400);
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError("User not found", 400);
  }

  const { hashedToken, tokenExpiry, unHashedToken } = user.generateToken();

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;

  const verificationUrl = `${env.BASE_URI}/api/v1/auth/verify/${unHashedToken}`;

  await sendEmail(
    user.email,
    "Verify Email",
    forgotPasswordMailgenContent(user.username, verificationUrl),
  );

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Reset password link sent successfully. Check Inbox",
      ),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError("Unauthorized Request",400)
  }

  let decodedToken: any;
  try {
    decodedToken = jwt.verify(incomingRefreshToken, env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(
      "Invalid or expired refresh token",
      400
    );
  }

  const user = await User.findById(decodedToken._id);

  if (!user) {
     throw new ApiError("Invalid Refresh Token", 400);
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new ApiError("Refresh Token Expired", 400);
  }
  const options = {
    httpOnly: true,
    secure: true,
    maxAge: 24 * 60 * 60 * 1000,
  };

  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshToken(user._id  as mongoose.Types.ObjectId);

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(new ApiResponse(200, {}, "Token Refreshed Successfully"));
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const token = req.params.token;
  const { newPassword } = req.body;

  if (!token || !newPassword) {
    throw new ApiError("Missing fields required", 400);
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: new Date() },
  });
  if (!user) {
    throw new ApiError("Invalid User or token expired", 400);
  }

  user.password = newPassword;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, {}, " Password reset successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = req.user;
  if (!oldPassword || !newPassword) {
    throw new ApiError("Missing fields required", 400);
  }

  if (!user) {
    throw new ApiError("Invalid user or toke expired", 400);
  }

  const oldPasswordCorrect = await user.isPasswordCorrect(user.password);
  if (!oldPasswordCorrect) {
    throw new ApiError("Invalid old password", 400);
  }
  user.password = newPassword;
  await user.save();
  res
    .status(200)
    .json(new ApiResponse(200, {}, "New Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError("User not found", 400);
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, user, "Current User Data Fetched Successfully!"),
    );

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
