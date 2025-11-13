import { Router } from "express";
import { OidRecordsController } from "../controllers";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/getAll", AuthMiddleware, OidRecordsController.getAll);

export default router;