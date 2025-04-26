import { Router } from "express";
import { loginUser, logoutUser, register, verifyEmail } from "../controllers/auth.controllers";
import { upload } from "../middlewares/multer.middleware";
import { verifyUser } from "../middlewares/auth.middleware";


const router = Router();

router.post("/register",upload.single("avatar"),register)
router.get("/verify/:token",verifyEmail)
router.get("/login",loginUser)
router.get("/logout",verifyUser, logoutUser)

export default router;
