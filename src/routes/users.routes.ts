import { Router } from "express";
import { UsersController } from "../controllers";
import { authMiddleware, adminMiddleware } from "../middlewares";

const router = Router();

router.get("/getAll", authMiddleware, adminMiddleware, UsersController.getAll);
router.get("/get", authMiddleware, UsersController.get);
router.post("/add", authMiddleware, adminMiddleware, UsersController.add);
router.post("/update", authMiddleware, adminMiddleware, UsersController.update);
router.delete("/remove", authMiddleware, adminMiddleware, UsersController.remove);

export default router;