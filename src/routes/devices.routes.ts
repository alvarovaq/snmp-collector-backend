import { Router } from "express";
import { DevicesController } from "../controllers";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/getAll", AuthMiddleware, DevicesController.getAll);
router.get("/get", AuthMiddleware, DevicesController.get);
router.post("/add", AuthMiddleware, DevicesController.add);
router.post("/update", AuthMiddleware, DevicesController.update);
router.delete("/remove", AuthMiddleware, DevicesController.remove);

export default router;