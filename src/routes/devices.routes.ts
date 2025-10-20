import { Router } from "express";
import { DevicesController } from "../controllers/device.controller";

const router = Router();

router.get("/getAll", DevicesController.getAll);
router.get("/get/:id", DevicesController.get);
router.post("/add", DevicesController.add);
router.post("/update", DevicesController.update);
router.delete("/remove/:id", DevicesController.remove);

export default router;