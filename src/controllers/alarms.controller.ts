import { Request, Response } from "express";
import { alarmsService, logger } from "../services";

export class AlarmsController {
    public static async getAll(req: Request, res: Response) {
        try {
            const alarms = alarmsService.getAlarms();
            res.status(200).json(alarms);
        } catch (err) {
            logger.error("Failed to get alarms", "AlarmsController", err);
            res.status(500).json();
        }
    }
    
    public static async get(req: Request, res: Response) {
        try {
            const id = parseInt(req.query.id as string);
            const alarm = alarmsService.getAlarm(id);
            
            if (!alarm) {
                return res.status(400).json();
            }

            res.status(200).json(alarm);
        } catch (err) {
            logger.error("Failed to get alarm", "AlarmsController", err);
            res.status(500).json();
        }
    }

    public static async read(req: Request, res: Response) {
        try {
            const id = parseInt(req.query.id as string);
            const alarm = await alarmsService.readAlarm(id, true);
            if (alarm === undefined)
                return res.status(400);
            
            res.status(200).json(alarm);
        } catch (err) {
            logger.error("Failed to read alarm", "AlarmsController", err);
            res.status(500).json();
        }
    }

    public static async unread(req: Request, res: Response) {
        try {
            const id = parseInt(req.query.id as string);
            const alarm = await alarmsService.readAlarm(id, false);
            if (alarm === undefined)
                return res.status(400);
            
            res.status(200).json(alarm);
        } catch (err) {
            logger.error("Failed to read alarm", "AlarmsController", err);
            res.status(500).json();
        }
    }
}
