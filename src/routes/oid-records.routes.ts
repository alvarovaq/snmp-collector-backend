import { Router } from "express";
import { OidRecordsController } from "../controllers/oid-records.controller";

const router = Router();

router.get("/getAll", OidRecordsController.getAll);

export default router;