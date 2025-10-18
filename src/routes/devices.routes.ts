import { Router } from "express";
import { DevicesController } from "../controllers/device.controller";

const router = Router();

router.get("/getDevices", DevicesController.getDevices);
router.get("/getDevice/:id", DevicesController.getDevice);

export default router;