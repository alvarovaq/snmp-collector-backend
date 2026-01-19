import { Router } from "express";
import { AlarmsController } from "../controllers";
import { authMiddleware } from "../middlewares";

const router = Router();

router.get("/getAll", authMiddleware, AlarmsController.getAll);
router.get("/get", authMiddleware, AlarmsController.get);
router.get("/read", authMiddleware, AlarmsController.read);
router.get("/unread", authMiddleware, AlarmsController.unread);

export default router;