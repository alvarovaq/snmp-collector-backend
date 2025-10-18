import { Request, Response } from "express";
import { logger, devicesService } from "../services";

export class DevicesController {
    public static async getAll(req: Request, res: Response) {
        try {
            const devices = devicesService.getDevices();
            res.status(200).json(devices);
        } catch (err) {
            logger.error("Failed to get devices", "DevicesController", err);
            res.status(500).json();
        }
    }
    
    public static async get(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const device = devicesService.getDevice(id);
            
            if (!device) {
                console.log(device);
                return res.status(400).json();
            }

            res.status(200).json({ success: true, device });
        } catch (err) {
            logger.error("Failed to get device", "DevicesController", err);
            res.status(500).json();
        }
    }
}
