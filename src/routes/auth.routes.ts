import { Router } from "express";
import { AuthController } from "../controllers";
import { authMiddleware } from "../middlewares";

const router = Router();

router.post("/login", AuthController.login);
router.get("/renew", authMiddleware, AuthController.renew);
router.post("/changePassword", authMiddleware, AuthController.changePassword);
router.post("/resetPasswordToken", AuthController.resetPasswordToken);
router.post("/resetPassword", AuthController.resetPassword);

export default router;