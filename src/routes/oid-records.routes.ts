import { Router } from "express";
import { OidRecordsController } from "../controllers";

const router = Router();

router.get("/getAll", OidRecordsController.getAll);

export default router;