import { Router } from "express";
import { RulesController } from "../controllers";
import { authMiddleware, adminMiddleware } from "../middlewares";

const router = Router();

router.get("/getAll", authMiddleware, RulesController.getAll);
router.get("/get", authMiddleware, RulesController.get);
router.post("/add", authMiddleware, adminMiddleware, RulesController.add);
router.post("/update", authMiddleware, adminMiddleware, RulesController.update);
router.delete("/remove", authMiddleware, adminMiddleware, RulesController.remove);

export default router;