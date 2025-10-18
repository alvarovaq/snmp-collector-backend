import { Request, Response } from "express";
import { logger, oidRecordsService } from "../services";

export class OidRecordsController {
    public static async getAll(req: Request, res: Response) {
        try {
            const records = oidRecordsService.getAll();
            res.status(200).json(records);
        } catch (err) {
            logger.error("Failed to get records", "OidRecordsController", err);
            res.status(500).json();
        }
    }
}
