import { Router } from "express";
import { DevicesController } from "../controllers";
import { authMiddleware, adminMiddleware } from "../middlewares";

const router = Router();

router.get("/getAll", authMiddleware, DevicesController.getAll);
router.get("/get", authMiddleware, DevicesController.get);
router.post("/add", authMiddleware, adminMiddleware, DevicesController.add);
router.post("/update", authMiddleware, adminMiddleware, DevicesController.update);
router.delete("/remove", authMiddleware, adminMiddleware, DevicesController.remove);

export default router;