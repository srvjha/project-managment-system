import { Router } from "express";
import { changeCurrentPassword, forgotPasswordRequest, getCurrentUser, loginUser, logoutUser, refreshAccessToken, register, resendEmailVerification, resetForgottenPassword, verifyEmail } from "../controllers/auth.controllers";
import { upload } from "../middlewares/multer.middleware";
import { verifyUser } from "../middlewares/auth.middleware";


const router = Router();

router.post("/register",upload.single("avatar"),register)
router.get("/verify/:token",verifyEmail)
router.get("/login",loginUser)
router.get("/resend-verification",verifyUser,resendEmailVerification)
router.get("/reset-forgotten-password",verifyUser,resetForgottenPassword)
router.get("/forgot-password/:token",verifyUser,forgotPasswordRequest)
router.get("/change-password",verifyUser,changeCurrentPassword)
router.get("/current-user",verifyUser,getCurrentUser)
router.get("/refresh-access-token",verifyUser,refreshAccessToken)
router.get("/logout",verifyUser, logoutUser)

export default router;
