import { Router } from "express";
import { OidRecordsController } from "../controllers";
import { authMiddleware } from "../middlewares";

const router = Router();

router.get("/getAll", authMiddleware, OidRecordsController.getAll);
router.post("/find", authMiddleware, OidRecordsController.find);

export default router;