import { Router } from "express";
import { AuthController } from "../controllers";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", AuthController.login);
router.get("/renew", AuthMiddleware, AuthController.renew);
router.post("/changePassword", AuthMiddleware, AuthController.changePassword);

export default router;