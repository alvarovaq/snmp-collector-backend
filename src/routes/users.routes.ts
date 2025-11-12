import { Router } from "express";
import { UsersController } from "../controllers";

const router = Router();

router.get("/getAll", UsersController.getAll);
router.get("/get", UsersController.get);
router.post("/add", UsersController.add);
router.post("/update", UsersController.update);
router.delete("/remove", UsersController.remove);

export default router;