import { Router } from "express";
import { DevicesController } from "../controllers";

const router = Router();

router.get("/getAll", DevicesController.getAll);
router.get("/get", DevicesController.get);
router.post("/add", DevicesController.add);
router.post("/update", DevicesController.update);
router.delete("/remove", DevicesController.remove);

export default router;