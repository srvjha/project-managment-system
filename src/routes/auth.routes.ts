import { Router } from "express";
import {
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
} from "../controllers/auth.controllers";
import { upload } from "../middlewares/multer.middleware";
import { verifyUser } from "../middlewares/auth.middleware";
import {
  authLimiter,
  emailsLimiter,
} from "../middlewares/ratelimit.middleware";

const router = Router();

router.post("/register", upload.single("avatar"), register);
router.get("/verify/email/:token", verifyEmail);
router.get(
  "/verify/email/resend",
  emailsLimiter,
  verifyUser,
  resendEmailVerification,
);
router.get("/login", authLimiter, loginUser);
router.get(
  "/password/reset",
  emailsLimiter,
  verifyUser,
  resetForgottenPassword,
);
router.get("/password/reset/:token", verifyUser, forgotPasswordRequest);
router.get("/password/change", verifyUser, changeCurrentPassword);
router.get("/me", verifyUser, getCurrentUser);
router.get("/refresh", verifyUser, refreshAccessToken);
router.get("/logout", verifyUser, logoutUser);

export default router;
