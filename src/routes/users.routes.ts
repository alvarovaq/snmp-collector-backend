import { Router } from "express";
import { UsersController } from "../controllers";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/getAll", AuthMiddleware, UsersController.getAll);
router.get("/get", AuthMiddleware, UsersController.get);
router.post("/add", AuthMiddleware, UsersController.add);
router.post("/update", AuthMiddleware, UsersController.update);
router.delete("/remove", AuthMiddleware, UsersController.remove);

export default router;