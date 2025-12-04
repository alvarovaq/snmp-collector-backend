import { Request, Response } from "express";
import { logger, oidRecordsService } from "../services";
import { OidRecordsDBService } from "../services/oid-records-db.service";
import { OidRecordsReq } from "../models";

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

    public static async find(req: Request, res: Response) {
        try {
            const recordsReq: OidRecordsReq = req.body;
            const records = await OidRecordsDBService.findRecords(recordsReq.deviceId, recordsReq.oid, new Date(recordsReq.start), new Date(recordsReq.end));
            res.status(200).json(records);
        } catch (err) {
            logger.error("Failed to find records", "OidRecordsController", err);
            res.status(500).json();
        }
    }
}
