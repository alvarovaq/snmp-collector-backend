import { Router } from "express";
import { DevicesController } from "../controllers/device.controller";

const router = Router();

router.get("/getAll", DevicesController.getAll);
router.get("/get/:id", DevicesController.get);

export default router;