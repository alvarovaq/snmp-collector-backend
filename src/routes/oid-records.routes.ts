import { Router } from "express";
import { OidRecordsController } from "../controllers";
import { authMiddleware } from "../middlewares";

const router = Router();

router.get("/getAll", authMiddleware, OidRecordsController.getAll);

export default router;