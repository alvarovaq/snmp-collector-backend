import { Request, Response } from "express";
import { logger, devicesService } from "../services";
import { Device } from "../models";

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
                return res.status(400).json();
            }

            res.status(200).json(device);
        } catch (err) {
            logger.error("Failed to get device", "DevicesController", err);
            res.status(500).json();
        }
    }

    public static async add(req: Request, res: Response) {
        try {
            const device: Device = req.body;

            const newDevice = await devicesService.addDevice(device);
            if (!newDevice)
                return res.status(400).json();
            return res.status(200).json(newDevice);
        } catch (err) {
            logger.error("Failed to add device", "DeviceController", err);
            res.status(500).json();
        }
    }

    public static async remove(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const ok = await devicesService.removeDevice(id);
            if (!ok)
                res.status(404).json();

            res.status(200).json();
        } catch (err) {
            logger.error("Failed to get device", "DevicesController", err);
            res.status(500).json();
        }
    }
}
